import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Play, Pause, Heart, MessageSquare, Send, Bookmark, BookmarkCheck, Share2, X, Image as ImageIcon, Video, Mic, MessageCircle, Copy, Users, Download } from "lucide-react";
import { toast } from "sonner";
import { logActivity, toggleSave, useIsSaved, type ActivityTarget } from "@/lib/activity-log";

export type MediaKind = "photo" | "video" | "voice" | "text";

export interface MediaItem {
  kind: MediaKind;
  from: string;
  emoji?: string;
  relation?: string;
  time?: string;
  caption?: string;
  body?: string;
  duration?: number;
  gradient?: string;
  scene?: string;
}

export function MediaViewerDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: MediaItem | null;
}) {
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [reply, setReply] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const target: ActivityTarget | null = useMemo(() => {
    if (!item) return null;
    const kindLabel =
      item.kind === "photo" ? "Photo" :
      item.kind === "video" ? "Video" :
      item.kind === "voice" ? "Voice note" : "Message";
    const id = `${item.kind}:${item.from}:${item.time ?? item.caption ?? item.body ?? "item"}`
      .toLowerCase().replace(/\s+/g, "-");
    return { id, label: `${kindLabel} from ${item.from}`, emoji: item.emoji, from: item.from };
  }, [item]);

  const saved = useIsSaved(target?.id ?? "");

  useEffect(() => {
    if (open) {
      const el = document.activeElement;
      if (el instanceof HTMLElement && el !== document.body) returnFocusRef.current = el;
    } else {
      setPlaying(false);
      setPos(0);
      setReply("");
      setShareOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!playing || !item?.duration) return;
    const i = setInterval(() => {
      setPos((p) => {
        if (p + 1 >= (item.duration ?? 0)) {
          setPlaying(false);
          return item.duration ?? 0;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [playing, item?.duration]);

  if (!item || !target) return null;

  const icon =
    item.kind === "photo" ? <ImageIcon className="w-4 h-4" /> :
    item.kind === "video" ? <Video className="w-4 h-4" /> :
    item.kind === "voice" ? <Mic className="w-4 h-4" /> :
    <MessageCircle className="w-4 h-4" />;

  const label =
    item.kind === "photo" ? "Photo" :
    item.kind === "video" ? "Video" :
    item.kind === "voice" ? "Voice note" :
    "Message";

  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const onLove = () => { logActivity("love", target); toast.success("❤️ sent"); };
  const onReplyFocus = () => document.getElementById("mv-reply")?.focus();
  const onSave = () => {
    const next = toggleSave(target);
    toast.success(next ? "Saved" : "Removed from saved");
  };
  const onSendReply = () => {
    const body = reply.trim();
    if (!body) return;
    logActivity("reply", target, body);
    toast.success(`Reply sent to ${item.from}`);
    onOpenChange(false);
  };
  const onShareTo = (destination: string) => {
    logActivity("share", target, destination);
    toast.success(`Shared with ${destination}`);
    setShareOpen(false);
  };

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
          <DialogTitle>{`${label} from ${item.from}`}</DialogTitle>
          <DialogDescription>{item.caption ?? label}</DialogDescription>
        </VisuallyHidden>

        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div className="w-10 h-10 rounded-full bg-muted grid place-items-center text-xl">{item.emoji ?? "👤"}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate flex items-center gap-2">
              {item.from}
              {saved && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5">
                  <BookmarkCheck className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              {icon}<span>{label}{item.time ? ` · ${item.time}` : ""}</span>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-muted grid place-items-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {(item.kind === "photo" || item.kind === "video") && (
          <div className={`relative aspect-square bg-gradient-to-br ${item.gradient ?? "from-slate-300 to-slate-500"} flex items-center justify-center`}>
            <div className="text-7xl drop-shadow-lg">{item.scene ?? "🖼️"}</div>
            {item.kind === "video" && (
              <button
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause" : "Play"}
                className="absolute inset-0 grid place-items-center group"
              >
                <div className="w-16 h-16 rounded-full bg-black/50 text-white grid place-items-center backdrop-blur group-hover:scale-110 transition">
                  {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
                </div>
              </button>
            )}
          </div>
        )}

        {item.kind === "voice" && (
          <div className="px-6 py-8 flex flex-col items-center">
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
              className="w-20 h-20 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lift"
            >
              {playing ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <div className="w-full mt-6">
              <div className="flex items-end gap-1 h-10 justify-center">
                {Array.from({ length: 28 }).map((_, i) => {
                  const active = item.duration ? (i / 28) * item.duration <= pos : false;
                  const h = 20 + Math.abs(Math.sin(i * 1.3)) * 60;
                  return (
                    <span
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1.5 rounded-full ${active ? "bg-primary" : "bg-muted-foreground/30"}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                <span>{mmss(pos)}</span>
                <span>{mmss(item.duration ?? 0)}</span>
              </div>
            </div>
          </div>
        )}

        {item.kind === "text" && (
          <div className="px-5 pt-2 pb-4">
            <div className="rounded-2xl bg-muted/50 p-4 text-[15px] leading-relaxed">
              {item.body ?? item.caption}
            </div>
          </div>
        )}

        {item.caption && item.kind !== "text" && (
          <div className="px-5 pt-3 text-sm text-foreground/90">{item.caption}</div>
        )}

        <div className="px-4 pt-3 pb-2 flex items-center gap-1">
          <IconAction icon={<Heart className="w-5 h-5" />} label="Love" onClick={onLove} />
          <IconAction icon={<MessageSquare className="w-5 h-5" />} label="Reply" onClick={onReplyFocus} />
          <IconAction
            icon={saved ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5" />}
            label={saved ? "Unsave" : "Save"}
            onClick={onSave}
            active={saved}
          />
          <IconAction icon={<Share2 className="w-5 h-5" />} label="Share" onClick={() => setShareOpen((v) => !v)} active={shareOpen} />
        </div>

        {shareOpen && (
          <div className="mx-3 mb-2 rounded-2xl border bg-card p-2 grid grid-cols-4 gap-1">
            <ShareBtn icon={<Users className="w-4 h-4" />} label="Family" onClick={() => onShareTo("Family group")} />
            <ShareBtn icon={<MessageSquare className="w-4 h-4" />} label="Priya" onClick={() => onShareTo("Priya")} />
            <ShareBtn icon={<MessageSquare className="w-4 h-4" />} label="Arjun" onClick={() => onShareTo("Arjun")} />
            <ShareBtn
              icon={<Copy className="w-4 h-4" />}
              label="Copy link"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(`myfamily://${target.id}`).catch(() => {});
                }
                onShareTo("clipboard");
              }}
            />
          </div>
        )}

        <div className="p-3 border-t flex items-center gap-2">
          <input
            id="mv-reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSendReply(); } }}
            placeholder={`Reply to ${item.from}…`}
            className="flex-1 h-11 rounded-full bg-muted/40 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            size="icon"
            className="h-11 w-11 rounded-full"
            disabled={!reply.trim()}
            onClick={onSendReply}
            aria-label="Send reply"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IconAction({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active ? true : undefined}
      className={`flex-1 h-11 rounded-2xl grid place-items-center transition ${active ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground/80"}`}
    >
      {icon}
    </button>
  );
}

function ShareBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-muted text-xs"
    >
      <span className="w-8 h-8 rounded-full bg-muted grid place-items-center">{icon}</span>
      <span className="truncate max-w-[64px]">{label}</span>
    </button>
  );
}
