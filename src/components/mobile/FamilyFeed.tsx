import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { useFamilyFeed } from "@/lib/queries/use-family-feed";
import { MediaViewerDialog, type MediaItem } from "./MediaViewerDialog";
import { SoftCard } from "./Card";
import { Image as ImageIcon, Video, Mic, MessageCircle, Play } from "lucide-react";

export function FamilyFeed() {
  const { familyId } = useAppState();
  const { data: familyFeed } = useFamilyFeed(familyId);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<MediaItem | null>(null);
  const openItem = (it: MediaItem) => { setItem(it); setOpen(true); };

  if (!familyFeed) return null;

  return (
    <div>
      <div className="flex items-center justify-between px-1 mt-2 mb-2">
        <h2 className="text-lg font-semibold">From your family</h2>
        <span className="text-xs text-muted-foreground">{familyFeed.length} new</span>
      </div>
      <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
        <ul className="flex gap-3 pb-2 snap-x snap-mandatory">
          {familyFeed.map((f) => {
            const badge =
              f.kind === "photo" ? <ImageIcon className="w-3.5 h-3.5" /> :
              f.kind === "video" ? <Video className="w-3.5 h-3.5" /> :
              f.kind === "voice" ? <Mic className="w-3.5 h-3.5" /> :
              <MessageCircle className="w-3.5 h-3.5" />;
            return (
              <li key={f.id} className="snap-start shrink-0 w-40">
                <button
                  onClick={() => openItem(f as MediaItem)}
                  aria-label={`${f.kind} from ${f.from}: ${f.caption}`}
                  className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-primary rounded-3xl"
                >
                  <SoftCard className="p-2 overflow-hidden">
                    <div className={`relative aspect-square rounded-2xl bg-gradient-to-br ${
                      "gradient" in f && f.gradient
                        ? f.gradient
                        : f.kind === "voice"
                          ? "from-purple-200 via-pink-200 to-rose-200"
                          : "from-slate-200 to-slate-300"
                    } grid place-items-center overflow-hidden`}>
                      <div className="text-4xl drop-shadow">
                        {"scene" in f && f.scene ? f.scene : f.kind === "voice" ? "🎙️" : "💬"}
                      </div>
                      {(f.kind === "video" || f.kind === "voice") && (
                        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white grid place-items-center">
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 rounded-full bg-black/50 text-white text-[10px] px-2 py-1 flex items-center gap-1">
                        {badge}
                        <span className="uppercase tracking-wide font-semibold">{f.kind}</span>
                      </div>
                    </div>
                    <div className="px-1 pt-2 pb-1">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>{f.emoji}</span>
                        <span className="truncate">{f.from}</span>
                        <span>·</span>
                        <span className="shrink-0">{f.time}</span>
                      </div>
                      <div className="text-[13px] font-medium mt-0.5 line-clamp-2 leading-snug">
                        {f.caption}
                      </div>
                    </div>
                  </SoftCard>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <MediaViewerDialog open={open} onOpenChange={setOpen} item={item} />
    </div>
  );
}
