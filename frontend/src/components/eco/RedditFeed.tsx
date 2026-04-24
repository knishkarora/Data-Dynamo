import { GlassCard } from "./GlassCard";
import { ArrowBigUp, MessageCircle, Share2, Loader2, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

const fetchFeed = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports?limit=20`);
  if (!response.ok) throw new Error("Network response was not ok");
  const data = await response.json();
  return data.reports || [];
};

const generateAnonName = () => {
  const adjectives = ['Brave', 'Quiet', 'Alert', 'Watchful', 'Eco', 'Green', 'Active', 'Swift', 'Bright'];
  const animals = ['Leopard', 'Eagle', 'Owl', 'Tiger', 'Wolf', 'Deer', 'Falcon', 'Panda', 'Lion'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
};

export function RedditFeed() {
  const queryClient = useQueryClient();
  const { getToken, userId, isLoaded } = useAuth();
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reddit-feed"],
    queryFn: fetchFeed,
    refetchInterval: 10000,
    enabled: isLoaded
  });

  const voteMutation = useMutation({
    mutationFn: async ({ reportId, direction }: { reportId: string, direction: 'up' | 'down' }) => {
      const token = await getToken();
      if (!token) throw new Error("Please log in to vote");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) throw new Error("Vote failed");
      return res.json();
    },
    onMutate: async ({ reportId, direction }) => {
      if (!userId) return;
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["reddit-feed"] });
      const previousReports = queryClient.getQueryData<any[]>(["reddit-feed"]);

      queryClient.setQueryData(["reddit-feed"], (old: any[] | undefined) => {
        if (!old) return [];
        return old.map(report => {
          if (report._id === reportId) {
            let upvotes = [...(report.upvotes || [])];
            let downvotes = [...(report.downvotes || [])];

            if (direction === 'up') {
              if (upvotes.includes(userId)) {
                // Already upvoted → undo the upvote (toggle off)
                upvotes = upvotes.filter(id => id !== userId);
              } else {
                // Not upvoted → add upvote and remove any existing downvote
                upvotes.push(userId);
                downvotes = downvotes.filter(id => id !== userId);
              }
            } else {
              if (downvotes.includes(userId)) {
                // Already downvoted → undo the downvote (toggle off)
                downvotes = downvotes.filter(id => id !== userId);
              } else {
                // Not downvoted → add downvote and remove any existing upvote
                downvotes.push(userId);
                upvotes = upvotes.filter(id => id !== userId);
              }
            }
            return { ...report, upvotes, downvotes };
          }
          return report;
        });
      });
      return { previousReports };
    },
    onSuccess: (data, { reportId }) => {
      // The server returns counts (numbers), not arrays.
      // Use the `userVote` field to correctly update the user's vote status
      // while preserving the array structure needed by the UI.
      queryClient.setQueryData(["reddit-feed"], (old: any[] | undefined) => {
        if (!old) return [];
        return old.map(report => {
          if (report._id === reportId) {
            // Ensure we're working with arrays (defensive)
            let upvotes = Array.isArray(report.upvotes) ? [...report.upvotes] : [];
            let downvotes = Array.isArray(report.downvotes) ? [...report.downvotes] : [];
            // Reconcile with what the server says is the current user's vote
            if (data.userVote === 'up') {
              if (!upvotes.includes(userId)) upvotes.push(userId);
              downvotes = downvotes.filter((id: string) => id !== userId);
            } else if (data.userVote === 'down') {
              if (!downvotes.includes(userId)) downvotes.push(userId);
              upvotes = upvotes.filter((id: string) => id !== userId);
            } else {
              // null = user has no vote (toggled off)
              upvotes = upvotes.filter((id: string) => id !== userId);
              downvotes = downvotes.filter((id: string) => id !== userId);
            }
            return { ...report, upvotes, downvotes };
          }
          return report;
        });
      });
    },
    onError: (err, vars, context) => {
      console.error("Vote Mutation Error:", err);
      // Roll back to previous state on error
      if (context?.previousReports) queryClient.setQueryData(["reddit-feed"], context.previousReports);
      toast.error(err.message);
    },
    // No onSettled invalidation — avoids race condition where a stale server
    // response overwrites the correct optimistic state before server catches up
  });

  // Separate state to hold locally-added comments (fire-and-keep approach)
  // These comments are shown immediately and persist in UI regardless of DB status
  const [localComments, setLocalComments] = useState<Record<string, any[]>>({});

  const handlePostComment = async (reportId: string) => {
    const text = commentInputs[reportId]?.trim();
    if (!text) return;

    // 1. Immediately add the comment to the local UI state
    const optimisticComment = {
      _id: 'local-' + Date.now(),
      text,
      anonymous_name: generateAnonName(),
      created_at: new Date().toISOString(),
      isLocal: true,
    };
    setLocalComments(prev => ({
      ...prev,
      [reportId]: [...(prev[reportId] || []), optimisticComment],
    }));

    // 2. Clear the input immediately so the user can type the next comment
    setCommentInputs(prev => ({ ...prev, [reportId]: '' }));

    // 3. Fire the DB write in the background — UI is NOT affected by its outcome
    try {
      const token = await getToken();
      if (!token) return; // Silently skip if not authenticated
      fetch(`${import.meta.env.VITE_API_URL}/api/reports/${reportId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      }).catch(err => console.warn('[Comment] Background DB write failed:', err));
    } catch (err) {
      console.warn('[Comment] Could not get auth token for background write:', err);
    }
  };

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    socket.on("new-report", () => {
      queryClient.invalidateQueries({ queryKey: ["reddit-feed"] });
    });
    // Optional: socket listener for new comments if you implement it later
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const handleShare = (report: any) => {
    const url = `${window.location.origin}/reports/${report._id}`;
    if (navigator.share) {
      navigator.share({ title: report.summary, text: report.description, url }).catch(() => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied");
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        reports.map((report: any) => {
          // Defensive: upvotes/downvotes may temporarily be counts (numbers) from the server
          // or arrays of userId strings — handle both gracefully
          const upArr = Array.isArray(report.upvotes) ? report.upvotes : [];
          const downArr = Array.isArray(report.downvotes) ? report.downvotes : [];
          const score = upArr.length - downArr.length;
          const hasUpvoted = userId && upArr.includes(userId);
          const hasDownvoted = userId && downArr.includes(userId);

          return (
            <GlassCard key={report._id} className="overflow-hidden border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="flex gap-1 md:gap-4 p-2 md:p-4">
                <div className="flex flex-col items-center gap-1 bg-white/[0.02] rounded-lg p-1 h-fit ring-1 ring-white/5">
                  <button 
                    onClick={() => voteMutation.mutate({ reportId: report._id, direction: 'up' })}
                    className={cn(
                      "p-1.5 rounded transition-all duration-200",
                      hasUpvoted ? "text-teal bg-teal/10 scale-110" : "text-muted-foreground hover:text-teal hover:bg-white/5"
                    )}
                  >
                    <ArrowBigUp className={cn("h-6 w-6", hasUpvoted && "fill-teal")} />
                  </button>
                  <span className={cn(
                    "text-xs font-black tabular-nums transition-colors duration-200",
                    hasUpvoted ? "text-teal" : hasDownvoted ? "text-bad" : "text-foreground"
                  )}>
                    {score > 0 ? `+${score}` : score}
                  </span>
                  <button 
                    onClick={() => voteMutation.mutate({ reportId: report._id, direction: 'down' })}
                    className={cn(
                      "p-1.5 rounded transition-all duration-200",
                      hasDownvoted ? "text-bad bg-bad/10 scale-110" : "text-muted-foreground hover:text-bad/70 hover:bg-white/5"
                    )}
                  >
                    <ArrowBigUp className={cn("h-6 w-6 rotate-180", hasDownvoted && "fill-bad/70")} />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-teal to-blueaccent flex items-center justify-center text-[10px] font-bold text-background uppercase shadow-[0_0_10px_rgba(45,212,191,0.3)]">
                      {report.category[0]}
                    </div>
                    <span className="text-[11px] font-bold text-foreground cursor-pointer">r/{report.category.replace('_', '')}</span>
                    <span className="text-[10px] text-muted-foreground">• {new Date(report.created_at).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-1.5 leading-tight tracking-tight">{report.summary}</h3>
                  <p className="text-sm text-muted-foreground/90 mb-4 line-clamp-3 leading-relaxed">{report.description}</p>

                  {report.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-white/5 mb-4 bg-black/40">
                      <img 
                        src={report.image_url.startsWith('http') ? report.image_url : `${import.meta.env.VITE_API_URL}${report.image_url}`} 
                        alt="" className="w-full max-h-[512px] object-contain mx-auto"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 md:gap-4 text-muted-foreground">
                    <button 
                      onClick={() => setActiveCommentId(activeCommentId === report._id ? null : report._id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-bold",
                        activeCommentId === report._id ? "bg-white/10 text-foreground" : "hover:bg-white/5 hover:text-foreground"
                      )}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {(report.comments?.length || 0) + (localComments[report._id]?.length || 0)} <span className="hidden sm:inline">Comments</span>
                    </button>
                    <button onClick={() => handleShare(report)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 hover:text-foreground rounded-full transition-all text-xs font-bold">
                      <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Share</span>
                    </button>
                    <div className="flex-1" />
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1",
                      report.status === 'resolved' ? "bg-good/10 text-good ring-good/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "bg-warn/10 text-warn ring-warn/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                    )}>
                      {report.status === 'resolved' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {report.status}
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeCommentId === report._id && (() => {
                      // Merge server comments with locally-added ones (fire-and-keep)
                      const allComments = [
                        ...(report.comments || []),
                        ...(localComments[report._id] || []),
                      ];
                      return (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t border-white/5">
                          <div className="space-y-4 mb-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {allComments.map((comment: any, idx: number) => (
                              <div key={comment._id || idx} className="flex gap-3">
                                <div className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center text-[8px] font-black ring-1 ring-white/10">AN</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-bold text-foreground/90">{comment.anonymous_name}</span>
                                    <span className="text-[9px] text-muted-foreground/60 uppercase font-bold">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 p-1 bg-white/[0.02] rounded-xl ring-1 ring-white/5 focus-within:ring-teal/30 transition-all">
                            <input
                              type="text"
                              value={commentInputs[report._id] || ""}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [report._id]: e.target.value }))}
                              placeholder="Share your thoughts anonymously..."
                              className="flex-1 bg-transparent border-none px-4 py-2 text-xs focus:ring-0 outline-none"
                              onKeyDown={(e) => e.key === 'Enter' && handlePostComment(report._id)}
                            />
                            <button
                              disabled={!commentInputs[report._id]?.trim()}
                              onClick={() => handlePostComment(report._id)}
                              className="bg-teal px-5 py-2 rounded-lg text-xs font-black text-background disabled:opacity-30 transition-all hover:brightness-110 shadow-[0_0_10px_rgba(45,212,191,0.2)]"
                            >
                              Post
                            </button>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>
              </div>
            </GlassCard>
          );
        })
      )}
    </div>
  );
}
