import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Phone, PhoneOff, PhoneIncoming, PhoneOutgoing,
  Mic, MicOff, Video, VideoOff, Volume2, VolumeX,
  Grid3x3, UserPlus, Pause, Play, MessageSquare, RotateCcw, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logCall, formatDuration, type CallDirection, type CallMode, type CallStatus } from "@/lib/call-log";
import { toast } from "sonner";

export type CallContact = {
  id?: string;
  name: string;
  emoji: string;
  relation?: string;
};

type Phase = "ringing" | "connecting" | "connected" | "ended";

export function CallDialog({
  open,
  onOpenChange,
  contact,
  direction,
  mode: initialMode = "audio",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contact: CallContact | null;
  direction: CallDirection;
  mode?: CallMode;
}) {
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<Phase>(direction === "incoming" ? "ringing" : "connecting");
  const [mode, setMode] = useState<CallMode>(initialMode);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [videoOn, setVideoOn] = useState(initialMode === "video");
  const [held, setHeld] = useState(false);
  const [keypad, setKeypad] = useState(false);
  const [dtmf, setDtmf] = useState("");
  const [endStatus, setEndStatus] = useState<CallStatus | null>(null);

  // Capture focus origin
  useEffect(() => {
    if (open) {
      const el = document.activeElement;
      if (el instanceof HTMLElement && el !== document.body) returnFocusRef.current = el;
    }
  }, [open]);

  // Reset when opened / closed
  useEffect(() => {
    if (!open) return;
    setPhase(direction === "incoming" ? "ringing" : "connecting");
    setMode(initialMode);
    setSeconds(0);
    setMuted(false);
    setSpeaker(true);
    setVideoOn(initialMode === "video");
    setHeld(false);
    setKeypad(false);
    setDtmf("");
    setEndStatus(null);
  }, [open, direction, initialMode]);

  // Auto-connect for outgoing after brief "connecting"
  useEffect(() => {
    if (!open) return;
    if (direction === "outgoing" && phase === "connecting") {
      const t = setTimeout(() => setPhase("connected"), 1800);
      return () => clearTimeout(t);
    }
  }, [open, direction, phase]);

  // Duration timer while connected + not held
  useEffect(() => {
    if (phase !== "connected" || held) return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [phase, held]);

  // Log on end
  const endWith = (status: CallStatus) => {
    if (!contact || endStatus) return;
    setEndStatus(status);
    setPhase("ended");
    logCall({
      name: contact.name,
      emoji: contact.emoji,
      relation: contact.relation,
      direction,
      mode,
      status,
      duration: status === "completed" ? seconds : 0,
    });
  };

  const accept = () => {
    setPhase("connecting");
    setTimeout(() => setPhase("connected"), 900);
  };
  const decline = () => {
    endWith("declined");
  };
  const cancel = () => {
    endWith("canceled");
  };
  const hangup = () => {
    endWith("completed");
  };

  const handleClose = (v: boolean) => {
    if (!v && phase !== "ended" && contact) {
      // Closing mid-call = hang up (or cancel/decline based on state)
      if (phase === "ringing") endWith(direction === "incoming" ? "declined" : "canceled");
      else endWith(phase === "connected" ? "completed" : "canceled");
    }
    onOpenChange(v);
  };

  if (!contact) return null;

  const statusLine =
    phase === "ringing" && direction === "incoming" ? `Incoming ${mode === "video" ? "video" : ""} call…` :
    phase === "ringing" ? "Ringing…" :
    phase === "connecting" ? "Connecting…" :
    phase === "connected" ? (held ? `On hold · ${formatDuration(seconds)}` : formatDuration(seconds)) :
    endStatus === "completed" ? `Call ended · ${formatDuration(seconds)}` :
    endStatus === "declined" ? "Call declined" :
    endStatus === "canceled" ? "Call canceled" :
    "Call ended";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-sm rounded-[32px] p-0 overflow-hidden border-0 shadow-lift gap-0"
        onCloseAutoFocus={(e) => {
          const el = returnFocusRef.current;
          if (el && document.contains(el)) { e.preventDefault(); el.focus(); }
        }}
      >
        <VisuallyHidden>
          <DialogTitle>{`${direction === "incoming" ? "Incoming" : "Outgoing"} ${mode} call — ${contact.name}`}</DialogTitle>
          <DialogDescription>{statusLine}</DialogDescription>
        </VisuallyHidden>

        {/* Stage */}
        <div className={cn(
          "relative min-h-[520px] flex flex-col",
          mode === "video" && phase !== "ended"
            ? "bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white"
            : "bg-gradient-to-b from-primary/15 via-background to-background",
        )}>
          {/* Top header */}
          <div className="flex items-center justify-between px-5 pt-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold opacity-80">
              {direction === "incoming" ? <PhoneIncoming className="w-3.5 h-3.5" /> : <PhoneOutgoing className="w-3.5 h-3.5" />}
              <span>myFamily · {mode === "video" ? "Video call" : "Audio call"}</span>
            </div>
            <button
              onClick={() => handleClose(false)}
              aria-label="Minimize call"
              className={cn(
                "w-9 h-9 rounded-full grid place-items-center",
                mode === "video" && phase !== "ended" ? "bg-white/10 hover:bg-white/20" : "hover:bg-muted",
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video preview (self) */}
          {mode === "video" && phase === "connected" && videoOn && (
            <div className="absolute top-16 right-4 w-24 h-32 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lift grid place-items-center text-3xl border-2 border-white/40">
              🙂
            </div>
          )}

          {/* Caller */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="relative">
              {phase === "ringing" && (
                <>
                  <span className="absolute inset-0 rounded-full bg-primary/25 animate-ping" />
                  <span className="absolute -inset-3 rounded-full bg-primary/15 animate-ping [animation-delay:200ms]" />
                </>
              )}
              <div className={cn(
                "relative w-32 h-32 rounded-full grid place-items-center text-6xl shadow-lift",
                mode === "video" && phase !== "ended" ? "bg-white/10 backdrop-blur ring-2 ring-white/30" : "bg-card ring-4 ring-primary/10",
              )}>
                {contact.emoji}
              </div>
            </div>
            <div className="mt-6 text-2xl font-bold">{contact.name}</div>
            {contact.relation && (
              <div className={cn("text-sm mt-1", mode === "video" && phase !== "ended" ? "text-white/70" : "text-muted-foreground")}>
                {contact.relation}
              </div>
            )}
            <div className={cn(
              "mt-3 text-sm font-medium tabular-nums",
              phase === "connected" && !held ? "text-success" : mode === "video" && phase !== "ended" ? "text-white/80" : "text-muted-foreground",
            )}>
              {statusLine}
            </div>

            {/* Keypad overlay */}
            {keypad && phase === "connected" && (
              <div className="mt-6 w-full max-w-[280px]">
                <div className="text-2xl tracking-widest font-mono h-8 mb-2">{dtmf || "—"}</div>
                <div className="grid grid-cols-3 gap-2">
                  {["1","2","3","4","5","6","7","8","9","*","0","#"].map((k) => (
                    <button
                      key={k}
                      onClick={() => { setDtmf((d) => (d + k).slice(-16)); }}
                      className={cn(
                        "h-12 rounded-2xl text-lg font-semibold",
                        mode === "video" ? "bg-white/10 hover:bg-white/20" : "bg-muted hover:bg-muted/70",
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className={cn(
            "px-6 pb-7 pt-4",
            mode === "video" && phase !== "ended" && "bg-gradient-to-t from-black/60 to-transparent",
          )}>
            {phase === "ringing" && direction === "incoming" ? (
              <div className="flex items-center justify-around">
                <ActionBtn label="Message" icon={<MessageSquare className="w-5 h-5" />} onClick={() => { toast("Reply sent"); }} variant={mode === "video" ? "dark" : "light"} />
                <RoundBtn label="Decline" icon={<PhoneOff className="w-7 h-7" />} onClick={decline} tone="destructive" size="lg" />
                <RoundBtn label="Accept" icon={<Phone className="w-7 h-7" />} onClick={accept} tone="success" size="lg" />
                <ActionBtn label="Remind" icon={<RotateCcw className="w-5 h-5" />} onClick={() => { toast("We'll remind you in 10 min"); onOpenChange(false); }} variant={mode === "video" ? "dark" : "light"} />
              </div>
            ) : phase === "ended" ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => onOpenChange(false)}
                  className="h-12 px-6 rounded-2xl bg-muted font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setPhase("connecting");
                    setSeconds(0);
                    setEndStatus(null);
                  }}
                  className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-medium"
                >
                  Call back
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <RoundBtn
                    label={muted ? "Unmute" : "Mute"}
                    icon={muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    onClick={() => setMuted((m) => !m)}
                    tone={muted ? "activeLight" : (mode === "video" ? "ghostDark" : "ghost")}
                  />
                  <RoundBtn
                    label={keypad ? "Hide keypad" : "Keypad"}
                    icon={<Grid3x3 className="w-5 h-5" />}
                    onClick={() => setKeypad((v) => !v)}
                    tone={keypad ? "activeLight" : (mode === "video" ? "ghostDark" : "ghost")}
                    disabled={phase !== "connected"}
                  />
                  <RoundBtn
                    label={speaker ? "Speaker on" : "Speaker off"}
                    icon={speaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    onClick={() => setSpeaker((s) => !s)}
                    tone={speaker ? "activeLight" : (mode === "video" ? "ghostDark" : "ghost")}
                  />
                  <RoundBtn
                    label={mode === "video" ? (videoOn ? "Video off" : "Video on") : "Turn on video"}
                    icon={mode === "video" && !videoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    onClick={() => {
                      if (mode === "audio") { setMode("video"); setVideoOn(true); toast("Video turned on"); }
                      else setVideoOn((v) => !v);
                    }}
                    tone={mode === "video" && videoOn ? "activeLight" : (mode === "video" ? "ghostDark" : "ghost")}
                  />
                  <RoundBtn
                    label="Add person"
                    icon={<UserPlus className="w-5 h-5" />}
                    onClick={() => toast("Add participant coming soon")}
                    tone={mode === "video" ? "ghostDark" : "ghost"}
                    disabled={phase !== "connected"}
                  />
                  <RoundBtn
                    label={held ? "Resume" : "Hold"}
                    icon={held ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    onClick={() => setHeld((h) => !h)}
                    tone={held ? "activeLight" : (mode === "video" ? "ghostDark" : "ghost")}
                    disabled={phase !== "connected"}
                  />
                </div>
                <div className="flex justify-center">
                  <RoundBtn
                    label={direction === "outgoing" && phase !== "connected" ? "Cancel" : "End call"}
                    icon={<PhoneOff className="w-7 h-7" />}
                    onClick={direction === "outgoing" && phase !== "connected" ? cancel : hangup}
                    tone="destructive"
                    size="lg"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RoundBtn({
  label, icon, onClick, tone = "ghost", size = "md", disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  tone?: "ghost" | "ghostDark" | "activeLight" | "destructive" | "success";
  size?: "md" | "lg";
  disabled?: boolean;
}) {
  const sizes = size === "lg" ? "w-16 h-16" : "w-14 h-14";
  const styles =
    tone === "destructive" ? "bg-destructive text-destructive-foreground hover:brightness-110" :
    tone === "success" ? "bg-success text-white hover:brightness-110" :
    tone === "activeLight" ? "bg-white text-foreground" :
    tone === "ghostDark" ? "bg-white/10 text-white hover:bg-white/20" :
    "bg-muted text-foreground hover:bg-muted/70";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          "rounded-full grid place-items-center transition shadow-soft",
          sizes, styles,
          disabled && "opacity-40 pointer-events-none",
        )}
      >
        {icon}
      </button>
      <span className="text-[11px] font-medium opacity-80">{label}</span>
    </div>
  );
}

function ActionBtn({
  label, icon, onClick, variant = "light",
}: { label: string; icon: React.ReactNode; onClick: () => void; variant?: "light" | "dark" }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        aria-label={label}
        className={cn(
          "w-12 h-12 rounded-full grid place-items-center",
          variant === "dark" ? "bg-white/10 text-white hover:bg-white/20" : "bg-muted hover:bg-muted/70",
        )}
      >
        {icon}
      </button>
      <span className="text-[11px] font-medium opacity-80">{label}</span>
    </div>
  );
}
