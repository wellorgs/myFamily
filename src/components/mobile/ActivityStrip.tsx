import { SoftCard } from "./Card";
import { Heart, MessageSquare, Bookmark, BookmarkX, Share2, Activity as ActivityIcon } from "lucide-react";
import { formatWhen, useActivityLog, useSavedCount, type ActivityKind } from "@/lib/activity-log";

const kindIcon = (k: ActivityKind) => {
  if (k === "love") return <Heart className="w-4 h-4 text-destructive" />;
  if (k === "reply") return <MessageSquare className="w-4 h-4 text-primary" />;
  if (k === "save") return <Bookmark className="w-4 h-4 text-primary" />;
  if (k === "unsave") return <BookmarkX className="w-4 h-4 text-muted-foreground" />;
  return <Share2 className="w-4 h-4 text-primary" />;
};

const kindVerb = (k: ActivityKind) => {
  if (k === "love") return "Reacted to";
  if (k === "reply") return "Replied to";
  if (k === "save") return "Saved";
  if (k === "unsave") return "Unsaved";
  return "Shared";
};

export function ActivityStrip({ title = "Recent activity", limit = 4 }: { title?: string; limit?: number }) {
  const log = useActivityLog();
  const savedCount = useSavedCount();
  const items = log.slice(0, limit);
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mt-4 mb-2 px-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ActivityIcon className="w-4 h-4 text-muted-foreground" />
          {title}
        </h2>
        {savedCount > 0 && (
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Bookmark className="w-3 h-3" /> {savedCount} saved
          </span>
        )}
      </div>
      <SoftCard className="p-2">
        <ul className="divide-y">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-3 py-3">
              <div className="w-8 h-8 rounded-xl bg-muted grid place-items-center shrink-0">
                {kindIcon(a.kind)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{kindVerb(a.kind)}</span>{" "}
                  <span className="text-muted-foreground">{a.targetLabel.toLowerCase()}</span>
                </div>
                {a.note && (
                  <div className="text-xs text-muted-foreground truncate mt-0.5">"{a.note}"</div>
                )}
                <div className="text-[11px] text-muted-foreground mt-0.5">{formatWhen(a.at)}</div>
              </div>
              {a.targetEmoji && <span className="text-lg">{a.targetEmoji}</span>}
            </li>
          ))}
        </ul>
      </SoftCard>
    </div>
  );
}
