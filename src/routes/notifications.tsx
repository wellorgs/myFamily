import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard, StatusDot } from "@/components/mobile/Card";
import { useAppState } from "@/lib/app-state";
import { useNotificationItems } from "@/lib/queries/use-notification-items";
import { firebaseAuth } from "@/integrations/firebase/client";
import { useMemo, useState } from "react";
import { MediaViewerDialog, type MediaItem } from "@/components/mobile/MediaViewerDialog";
import { CallDialog, type CallContact } from "@/components/mobile/CallDialog";
import { ActivityStrip } from "@/components/mobile/ActivityStrip";
import {
  ChevronRight,
  ShieldAlert,
  Pill,
  Mic,
  Image as ImageIcon,
  Footprints,
  Sparkles,
  PhoneMissed,
  PhoneIncoming,
  PhoneCall,
  CheckCheck,
  Inbox,
} from "lucide-react";
import { markAllRead, markRead, markUnread, useReadMap } from "@/lib/notifications-store";

type FilterKey = "all" | "calls" | "sos" | "meds" | "photos";

const FILTERS: { key: FilterKey; label: string; kinds: readonly string[] | null }[] = [
  { key: "all", label: "All", kinds: null },
  { key: "calls", label: "Calls", kinds: ["call"] },
  { key: "sos", label: "SOS", kinds: ["sos"] },
  { key: "meds", label: "Meds", kinds: ["medicine"] },
  { key: "photos", label: "Photos", kinds: ["photo"] },
];

const FILTER_KEYS: FilterKey[] = FILTERS.map((f) => f.key);

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — myFamily" }] }),
  validateSearch: (raw: Record<string, unknown>): { filter: FilterKey } => {
    const v = typeof raw.filter === "string" ? raw.filter : "all";
    return { filter: (FILTER_KEYS.includes(v as FilterKey) ? v : "all") as FilterKey };
  },
  component: Notifications,
});

const iconFor = (k: string, tone: string) => {
  if (k === "call")
    return tone === "red" ? (
      <PhoneMissed className="w-4 h-4 text-destructive" />
    ) : (
      <PhoneIncoming className="w-4 h-4 text-primary" />
    );
  if (k === "sos") return <ShieldAlert className="w-4 h-4 text-destructive" />;
  if (k === "medicine") return <Pill className="w-4 h-4 text-warning" />;
  if (k === "voice") return <Mic className="w-4 h-4 text-primary" />;
  if (k === "photo") return <ImageIcon className="w-4 h-4 text-primary" />;
  if (k === "walk") return <Footprints className="w-4 h-4 text-success" />;
  return <Sparkles className="w-4 h-4 text-primary" />;
};

const callContactFor = (title: string): CallContact =>
  title.toLowerCase().includes("dad")
    ? { name: "Dad (Rajiv)", emoji: "👴🏽", relation: "Parent" }
    : title.toLowerCase().includes("priya")
      ? { name: "Priya", emoji: "👩🏽", relation: "Daughter" }
      : title.toLowerCase().includes("arjun")
        ? { name: "Arjun", emoji: "👨🏽", relation: "Son" }
        : { name: "Mom (Anita)", emoji: "👩🏽‍🦳", relation: "Parent" };

function Notifications() {
  const user = firebaseAuth.currentUser;
  const userId = user?.uid || "";
  const { data: notificationItems } = useNotificationItems(userId);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeFilter: FilterKey =
    (FILTERS.find((f) => f.key === search.filter)?.key ?? "all") as FilterKey;

  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [callContact, setCallContact] = useState<CallContact | null>(null);

  const readMap = useReadMap();

  const counts = useMemo(() => {
    const out: Record<FilterKey, number> = { all: 0, calls: 0, sos: 0, meds: 0, photos: 0 };
    for (const n of notificationItems ?? []) {
      if (readMap[n.id]) continue;
      out.all += 1;
      for (const f of FILTERS) {
        if (f.key === "all") continue;
        if (f.kinds!.includes(n.kind)) out[f.key] += 1;
      }
    }
    return out;
  }, [readMap, notificationItems]);

  const activeDef = FILTERS.find((f) => f.key === activeFilter)!;
  const visible = useMemo(() => {
    if (!notificationItems) return [];
    if (!activeDef.kinds) return notificationItems;
    return notificationItems.filter((n) => activeDef.kinds!.includes(n.kind));
  }, [activeDef, notificationItems]);

  // Guard AFTER all hooks so the hook order never changes between renders.
  if (!notificationItems) return null;

  const anyUnreadVisible = visible.some((n) => !readMap[n.id]);

  const setFilter = (key: FilterKey) =>
    navigate({ search: { filter: key }, replace: true });

  const tap = (n: (typeof notificationItems)[number]) => {
    markRead(n.id);
    if (n.kind === "call") {
      setCallContact(callContactFor(n.title));
      setCallOpen(true);
      return;
    }
    const media: MediaItem =
      n.kind === "voice"
        ? {
            kind: "voice",
            from: "Priya",
            emoji: "👩🏽",
            time: n.time,
            caption: n.detail,
            duration: 24,
          }
        : n.kind === "photo"
          ? {
              kind: "photo",
              from: "Arjun",
              emoji: "👨🏽",
              time: n.time,
              caption: n.detail,
              gradient: "from-emerald-300 via-teal-200 to-sky-200",
              scene: "🥾🏞️",
            }
          : {
              kind: "text",
              from: n.title,
              emoji: n.kind === "sos" ? "🚨" : "🔔",
              time: n.time,
              body: n.detail,
            };
    setMediaItem(media);
    setMediaOpen(true);
  };

  const markAllVisible = () => {
    markAllRead(visible.map((n) => n.id));
  };

  return (
    <PhoneFrame>
      <Screen
        title="Notifications"
        back={true}
        right={
          <Link
            to="/calls"
            aria-label="Open call log"
            className="w-11 h-11 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70"
          >
            <PhoneCall className="w-5 h-5" />
          </Link>
        }
      >
        <div
          role="tablist"
          aria-label="Notification filters"
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
        >
          {FILTERS.map((f) => {
            const active = f.key === activeFilter;
            const c = counts[f.key];
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 inline-flex items-center gap-2 px-4 h-9 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                <span>{f.label}</span>
                {c > 0 && (
                  <span
                    aria-label={`${c} unread`}
                    className={`min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-semibold grid place-items-center ${
                      active
                        ? "bg-background text-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {c > 9 ? "9+" : c}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="text-xs text-muted-foreground">
            {visible.length} {visible.length === 1 ? "alert" : "alerts"}
            {counts[activeFilter] > 0 ? ` · ${counts[activeFilter]} unread` : ""}
          </div>
          <button
            onClick={markAllVisible}
            disabled={!anyUnreadVisible}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary disabled:text-muted-foreground disabled:cursor-not-allowed hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-1 py-0.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        {visible.length === 0 ? (
          <SoftCard className="p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <Inbox className="w-8 h-8 text-muted-foreground" />
              <div className="text-sm font-medium">No {activeDef.label.toLowerCase()} alerts</div>
              <div className="text-xs text-muted-foreground">You're all caught up here.</div>
            </div>
          </SoftCard>
        ) : (
          <SoftCard className="p-2">
            <ul className="divide-y">
              {visible.map((n) => {
                const isRead = Boolean(readMap[n.id]);
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => tap(n)}
                      aria-label={`${n.title}${isRead ? "" : ", unread"}`}
                      className={`w-full flex items-center gap-3 px-3 py-4 text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                        isRead ? "hover:bg-muted/40" : "bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      <span aria-hidden className="w-2 flex justify-center">
                        {isRead ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </span>
                      <StatusDot tone={n.tone as any} />
                      <div className="w-8 h-8 rounded-xl bg-muted grid place-items-center shrink-0">
                        {iconFor(n.kind, n.tone)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm truncate ${isRead ? "font-normal text-muted-foreground" : "font-semibold"}`}
                        >
                          {n.title}
                        </div>
                        <div className="text-xs text-muted-foreground">{n.time}</div>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          isRead ? markUnread(n.id) : markRead(n.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            isRead ? markUnread(n.id) : markRead(n.id);
                          }
                        }}
                        aria-label={isRead ? "Mark as unread" : "Mark as read"}
                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {isRead ? "Unread" : "Read"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </SoftCard>
        )}

        <ActivityStrip title="Your activity" limit={8} />
        <MediaViewerDialog open={mediaOpen} onOpenChange={setMediaOpen} item={mediaItem} />
        <CallDialog
          open={callOpen}
          onOpenChange={setCallOpen}
          contact={callContact}
          direction="outgoing"
          mode="audio"
        />
      </Screen>
    </PhoneFrame>
  );
}
