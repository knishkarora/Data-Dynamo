import { GlassCard } from "./GlassCard";
import { Send, Sparkles, Loader2, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const suggestions = [
  "Why is AQI spiking in Ludhiana?",
  "Show stubble fire trends",
  "Compare budget vs spend",
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatPanel() {
  const { getToken, isSignedIn } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi 👋 — air quality in Punjab is currently unhealthy in some regions. Want a breakdown by city?' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const mutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error("Failed to get AI response");
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
    }
  });

  const handleSend = (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || mutation.isPending) return;
    if (!isSignedIn) return setMessages(prev => [...prev, { role: 'assistant', content: "Please sign in to chat with EcoLens AI." }]);

    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setInput("");
    mutation.mutate(messageToSend);
  };

  return (
    <GlassCard className="p-5 flex flex-col h-[400px]">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal/30 to-blueaccent/20 ring-1 ring-teal/30">
          <Sparkles className="h-4 w-4 text-teal" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-sm text-foreground">EcoLens AI</p>
          <p className="text-[10px] text-muted-foreground">Powered by Llama 3 & Groq</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none"
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={cn(
              "max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed",
              m.role === 'user' 
                ? "ml-auto bg-teal/10 text-teal ring-1 ring-teal/20" 
                : "bg-white/[0.025] text-foreground/85 ring-1 ring-white/5"
            )}
          >
            {m.content}
          </div>
        ))}
        {mutation.isPending && (
          <div className="bg-white/[0.025] text-foreground/85 ring-1 ring-white/5 max-w-[40px] rounded-2xl p-3 flex justify-center">
            <Loader2 className="h-3 w-3 animate-spin text-teal" />
          </div>
        )}
      </div>

      <div className="mt-4 shrink-0">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="rounded-full bg-white/[0.03] px-2.5 py-1 text-[10px] text-muted-foreground ring-1 ring-white/5 transition hover:bg-white/[0.07] hover:text-foreground disabled:opacity-50"
              disabled={mutation.isPending}
            >
              {s}
            </button>
          ))}
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="group flex items-center gap-2 rounded-full bg-white/[0.025] px-3 py-2 ring-1 ring-white/5 transition focus-within:ring-teal/40 focus-within:shadow-[0_0_24px_-10px_var(--teal)]"
        >
          <input
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Ask EcoLens AI…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={mutation.isPending || !input.trim()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal to-blueaccent text-background disabled:opacity-50 transition active:scale-95"
          >
            {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </button>
        </form>
      </div>
    </GlassCard>
  );
}