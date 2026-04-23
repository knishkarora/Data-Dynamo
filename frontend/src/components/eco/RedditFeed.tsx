import { GlassCard } from "./GlassCard";
import { ArrowBigUp, MessageCircle, Share2, MapPin, Loader2, CheckCircle2, Clock } from "lucide-react";
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

export function RedditFeed() {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ["reddit-feed"],
    queryFn: fetchFeed,
    refetchInterval: 10000,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ reportId, direction }: { reportId: string, direction: 'up' | 'down' }) => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) throw new Error("Failed to vote");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reddit-feed"] });
    },
    onError: () => {
      toast.error("Please login to vote");
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ reportId, text }: { reportId: string, text: string }) => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/${reportId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["reddit-feed"] });
      toast.success("Comment posted anonymously");
    },
    onError: () => {
      toast.error("Failed to post comment. Ensure you are logged in.");
    }
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    socket.on("new-report", () => {
      queryClient.invalidateQueries({ queryKey: ["reddit-feed"] });
    });
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const handleShare = (report: any) => {
    const url = `${window.location.origin}/reports/${report._id}`;
    if (navigator.share) {
      navigator.share({
        title: report.summary || 'Environmental Report',
        text: report.description,
        url: url,
      }).catch(() => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal" />
        </div>
      ) : (
        reports.map((report: any) => {
          const score = (report.upvotes?.length || 0) - (report.downvotes?.length || 0);
          const hasUpvoted = report.upvotes?.includes(userId);
          const hasDownvoted = report.downvotes?.includes(userId);

          return (
            <GlassCard key={report._id} className="overflow-hidden border-white/5 hover:border-white/10 transition-colors">
              <div className="flex gap-1 md:gap-4 p-2 md:p-4">
                {/* Upvote Sidebar */}
                <div className="flex flex-col items-center gap-1 bg-white/[0.02] rounded-lg p-1 h-fit">
                  <button 
                    onClick={() => voteMutation.mutate({ reportId: report._id, direction: 'up' })}
                    className={cn(
                      "p-1 hover:bg-white/5 rounded transition-colors",
                      hasUpvoted ? "text-teal scale-110" : "text-muted-foreground hover:text-teal"
                    )}
                  >
                    <ArrowBigUp className={cn("h-6 w-6", hasUpvoted && "fill-teal")} />
                  </button>
                  <span className={cn("text-xs font-bold", hasUpvoted ? "text-teal" : hasDownvoted ? "text-bad" : "text-foreground")}>
                    {score}
                  </span>
                  <button 
                    onClick={() => voteMutation.mutate({ reportId: report._id, direction: 'down' })}
                    className={cn(
                      "p-1 hover:bg-white/5 rounded transition-colors",
                      hasDownvoted ? "text-bad scale-110" : "text-muted-foreground hover:text-bad/70"
                    )}
                  >
                    <ArrowBigUp className={cn("h-6 w-6 rotate-180", hasDownvoted && "fill-bad/70")} />
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-teal to-blueaccent flex items-center justify-center text-[10px] font-bold text-background uppercase">
                      {report.category[0]}
                    </div>
                    <span className="text-[11px] font-bold text-foreground hover:underline cursor-pointer">
                      r/{report.category.replace('_', '')}
                    </span>
                    <span className="text-[10px] text-muted-foreground">• Posted by anonymous</span>
                    <span className="text-[10px] text-muted-foreground">• {new Date(report.created_at).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">
                    {report.summary || `Environmental Issue in ${report.category.replace('_', ' ')}`}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {report.description}
                  </p>

                  {report.image_url && (
                    <div className="rounded-xl overflow-hidden border border-white/5 mb-4 bg-black/20">
                      <img 
                        src={report.image_url.startsWith('http') ? report.image_url : `${import.meta.env.VITE_API_URL}${report.image_url}`} 
                        alt="Report evidence" 
                        className="w-full max-h-[500px] object-contain mx-auto"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 md:gap-4 text-muted-foreground">
                    <button 
                      onClick={() => setActiveCommentId(activeCommentId === report._id ? null : report._id)}
                      className="flex items-center gap-1.5 md:gap-2 px-2 py-1.5 hover:bg-white/5 rounded transition-colors text-xs font-medium"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {report.comments?.length || 0} Comments
                    </button>
                    <button 
                      onClick={() => handleShare(report)}
                      className="flex items-center gap-1.5 md:gap-2 px-2 py-1.5 hover:bg-white/5 rounded transition-colors text-xs font-medium"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                    <div className="flex-1" />
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider",
                      report.status === 'resolved' ? "bg-good/10 text-good ring-1 ring-good/30" : 
                      report.status === 'verified' ? "bg-teal/10 text-teal ring-1 ring-teal/30" : "bg-warn/10 text-warn ring-1 ring-warn/30"
                    )}>
                      {report.status === 'resolved' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {report.status}
                    </div>
                  </div>

                  {/* Comment Section */}
                  <AnimatePresence>
                    {activeCommentId === report._id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-white/5"
                      >
                        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {report.comments?.map((comment: any, idx: number) => (
                            <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold">
                                AN
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[11px] font-bold text-foreground/80">{comment.anonymous_name}</span>
                                  <span className="text-[9px] text-muted-foreground">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{comment.text}</p>
                              </div>
                            </div>
                          ))}
                          {(!report.comments || report.comments.length === 0) && (
                            <p className="text-center py-4 text-xs text-muted-foreground italic">No comments yet. Be the first to speak up!</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add an anonymous comment..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal"
                            onKeyDown={(e) => e.key === 'Enter' && commentMutation.mutate({ reportId: report._id, text: commentText })}
                          />
                          <button 
                            disabled={!commentText || commentMutation.isPending}
                            onClick={() => commentMutation.mutate({ reportId: report._id, text: commentText })}
                            className="bg-teal px-4 py-2 rounded-lg text-xs font-bold text-background disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                          >
                            {commentMutation.isPending ? "..." : "Post"}
                          </button>
                        </div>
                      </motion.div>
                    )}
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
