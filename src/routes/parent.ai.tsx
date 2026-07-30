import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Mic, Sparkles, Loader } from "lucide-react";
import { useState } from "react";
import { callGeminiAI, type Message } from "@/lib/gemini-ai";

export const Route = createFileRoute("/parent/ai")({
  head: () => ({
    meta: [
      { title: "AI companion — myFamily" },
      { name: "description", content: "Ask your AI health companion anything." },
    ],
  }),
  component: AI,
});

const SUGGESTIONS = [
  "Call my daughter",
  "Explain this medicine",
  "What's today's weather?",
  "Read my appointments",
  "Tell me today's medicines",
  "Play relaxing music",
  "What should I eat?",
  "Read my messages",
];

function AI() {
  const [holding, setHolding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hello John. How can I help you today?" },
  ]);

  const ask = async (q: string) => {
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    // Build conversation history for Gemini
    const history: Message[] = messages
      .filter((m) => m.role === "ai")
      .map((m, i) => ({
        role: "model" as const,
        parts: [{ text: m.text }],
      }));

    const reply = await callGeminiAI(q, history);
    setMessages((m) => [...m, { role: "ai", text: reply }]);
    setLoading(false);
  };

  return (
    <Screen title="AI" subtitle="Ask anything — hold to talk.">
      <div className="space-y-4 mb-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card shadow-soft text-foreground"
              }`}
            >
              {m.role === "ai" && (
                <Sparkles className="inline w-4 h-4 mr-2 opacity-60" />
              )}
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <SoftCard className="mb-6 p-4 bg-primary/5">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        </SoftCard>
      )}

      {/* Suggested prompts */}
      <SoftCard className="mb-6 p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          Try asking
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => !loading && ask(s)}
              disabled={loading}
              className="rounded-full bg-muted hover:bg-muted-foreground/20 px-4 h-9 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </SoftCard>

      {/* Mic button */}
      <div className="flex flex-col items-center pt-6">
        <button
          onPointerDown={() => setHolding(true)}
          onPointerUp={() => {
            setHolding(false);
            if (!loading) ask("(voice message)");
          }}
          onPointerLeave={() => setHolding(false)}
          disabled={loading}
          aria-label="Hold to talk"
          className={`w-24 h-24 rounded-full grid place-items-center transition-all shadow-lift disabled:opacity-50 ${
            holding ? "bg-destructive scale-110" : "bg-primary"
          } text-primary-foreground`}
        >
          <Mic className="w-10 h-10" />
        </button>
        <p className="mt-4 text-sm text-muted-foreground font-medium">
          {loading ? "Processing…" : holding ? "Listening…" : "Hold to talk"}
        </p>
      </div>
    </Screen>
  );
}
