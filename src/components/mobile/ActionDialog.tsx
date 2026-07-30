import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Phone, Video, Mic, MessageSquare, X, Send } from "lucide-react";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

export type ActionKind = "call" | "video" | "voice" | "text";

export function ActionDialog({
  open,
  onOpenChange,
  kind,
  contactName,
  emoji = "👤",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kind: ActionKind;
  contactName: string;
  emoji?: string;
}) {
  const t = useT();
  const [seconds, setSeconds] = useState(0);
  const [connected, setConnected] = useState(false);
  const [msg, setMsg] = useState("");
  const [recording, setRecording] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      const el = document.activeElement;
      if (el instanceof HTMLElement && el !== document.body) {
        returnFocusRef.current = el;
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSeconds(0);
      setConnected(false);
      setMsg("");
      setRecording(false);
      return;
    }
    if (kind === "call" || kind === "video") {
      const c = setTimeout(() => setConnected(true), 1600);
      return () => clearTimeout(c);
    }
  }, [open, kind]);

  useEffect(() => {
    if (!connected) return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [connected]);

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const icon =
    kind === "call" ? <Phone className="w-6 h-6" /> :
    kind === "video" ? <Video className="w-6 h-6" /> :
    kind === "voice" ? <Mic className="w-6 h-6" /> :
    <MessageSquare className="w-6 h-6" />;

  const title =
    kind === "call" ? t("l.calling") :
    kind === "video" ? t("l.videoCall") :
    kind === "voice" ? t("l.voiceMessage") :
    t("l.textMessage");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm rounded-3xl p-0 overflow-hidden border-0 shadow-lift"
        onCloseAutoFocus={(e) => {
          const el = returnFocusRef.current;
          if (el && document.contains(el)) {
            e.preventDefault();
            el.focus();
          }
        }}
      >
        <VisuallyHidden>
          <DialogTitle>{`${title} — ${contactName}`}</DialogTitle>
          <DialogDescription>{`${title} ${contactName}`}</DialogDescription>
        </VisuallyHidden>
        <div className="bg-gradient-to-b from-primary/10 to-background p-6 flex flex-col items-center text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            {icon}
            <span>{title}</span>
          </div>
          <div className={`w-24 h-24 rounded-full bg-card grid place-items-center text-5xl mt-4 shadow-soft ${kind === "call" || kind === "video" ? "animate-pulse" : ""}`}>
            {emoji}
          </div>
          <div className="mt-3 text-xl font-semibold">{contactName}</div>
          {(kind === "call" || kind === "video") && (
            <div className="mt-1 text-sm text-muted-foreground">
              {connected ? `${t("l.connected")} · ${mmss}` : `${t("l.calling")}…`}
            </div>
          )}
        </div>

        {kind === "text" && (
          <div className="p-5 space-y-3">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={t("l.typeMessage")}
              rows={4}
              className="w-full rounded-2xl border bg-muted/30 p-4 text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <Button
              className="w-full h-12 rounded-2xl text-base"
              disabled={!msg.trim()}
              onClick={() => {
                toast.success(t("l.messageSent"));
                onOpenChange(false);
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              {t("action.send")}
            </Button>
          </div>
        )}

        {kind === "voice" && (
          <div className="p-6 flex flex-col items-center">
            <button
              onPointerDown={() => setRecording(true)}
              onPointerUp={() => {
                if (recording) {
                  setRecording(false);
                  toast.success(t("l.voiceSent"));
                  onOpenChange(false);
                }
              }}
              onPointerLeave={() => setRecording(false)}
              aria-label={t("l.holdToTalk")}
              className={`w-24 h-24 rounded-full grid place-items-center transition-all shadow-lift ${
                recording ? "bg-destructive scale-110" : "bg-primary"
              } text-primary-foreground`}
            >
              <Mic className="w-10 h-10" />
            </button>
            <div className="mt-4 text-sm text-muted-foreground">
              {recording ? t("l.recording") : t("l.holdToTalk")}
            </div>
          </div>
        )}

        <div className="px-5 pb-5 pt-2 flex justify-center">
          <Button
            variant={kind === "call" || kind === "video" ? "destructive" : "secondary"}
            className="h-12 px-8 rounded-2xl"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4 mr-2" />
            {kind === "call" || kind === "video" ? t("action.end") : t("action.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
