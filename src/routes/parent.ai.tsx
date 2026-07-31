import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles, Loader, CheckCircle2, AlertCircle, Edit2, X } from "lucide-react";
import { useState, useRef } from "react";
import { callGeminiAI, type Message } from "@/lib/gemini-ai";
import { toast } from "sonner";

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
  const [transcribedText, setTranscribedText] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [editText, setEditText] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const ask = async (q: string) => {
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    // Build conversation history for Gemini
    const history: Message[] = messages
      .filter((m) => m.role === "ai")
      .map((m) => ({
        role: "model" as const,
        parts: [{ text: m.text }],
      }));

    try {
      const reply = await callGeminiAI(q, history);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to get response";
      toast.error(error);
    }
    setLoading(false);
  };

  const startListening = () => {
    setMicError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("Speech recognition not supported on this device");
      toast.error("Microphone not available on this device");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onstart = () => {
      setMicError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscribedText((finalTranscript + interimTranscript).trim());
    };

    recognition.onerror = (event: any) => {
      const errorMsg = `Mic error: ${event.error}`;
      setMicError(errorMsg);
      toast.error(errorMsg);
      setHolding(false);
    };

    recognition.onend = () => {
      if (finalTranscript.trim()) {
        setTranscribedText(finalTranscript.trim());
        setEditText(finalTranscript.trim());
        setShowReview(true);
      }
      setHolding(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const submitVoiceMessage = () => {
    if (!editText.trim()) {
      toast.error("Please say something or type a message");
      return;
    }
    setShowReview(false);
    ask(editText.trim());
  };

  return (
    <Screen title="AI" subtitle="Ask anything — hold to talk.">
      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-background rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Review your message</h3>
              <button
                onClick={() => setShowReview(false)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-muted/50 rounded-2xl p-4">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-transparent text-sm leading-relaxed resize-none focus:outline-none min-h-24"
                placeholder="Edit your message here..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full h-12"
                onClick={() => setShowReview(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-full h-12"
                onClick={submitVoiceMessage}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {/* Error indicator */}
      {micError && (
        <SoftCard className="mb-6 p-4 bg-destructive/5 border-destructive/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{micError}</span>
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
          onPointerDown={() => {
            setHolding(true);
            startListening();
          }}
          onPointerUp={() => {
            stopListening();
          }}
          onPointerLeave={() => {
            if (holding) stopListening();
            setHolding(false);
          }}
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
