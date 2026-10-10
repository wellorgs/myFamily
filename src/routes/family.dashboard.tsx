import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BellRinging, CalendarBlank, ChartLineUp, Clock, MapPin, ChatCircle, Phone, VideoCamera, Heartbeat, type Icon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Screen } from "@/components/mobile/Screen";
import { FamilyTopBar } from "@/components/mobile/ParentSwitcher";
import { PersonHero, RecapPill, RecapSheet, TileGrid, useVitals, type Tile } from "@/components/mobile/KinBlocks";
import { CheckInChip, ThereTime } from "@/components/mobile/FamilyBlocks";
import { ActionDialog, type ActionKind } from "@/components/mobile/ActionDialog";
import { MediaViewerDialog, type MediaItem } from "@/components/mobile/MediaViewerDialog";
import { CallDialog, type CallContact } from "@/components/mobile/CallDialog";
import { useAppState } from "@/lib/app-state";
import { useParents } from "@/lib/queries/use-parents";
import { useSelectedParent } from "@/lib/selected-parent";
import { useDashboardGuard } from "@/lib/route-guards";
import { nudgeCooldown, sendNudge } from "@/lib/nudge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/family/dashboard")({
  head: () => ({ meta: [{ title: "Home — myFamily" }] }),
  component: Dashboard,
});

type P = {
  id: string; name: string; status: string; lastSeen: string; wellness: number; medsPending: number;
  steps: number; sleep: string; battery: number; timezone?: string; age?: number | string; device?: string;
  photoUrl?: string; nextMedicine?: { name?: string; dose?: string; time?: string }; nextAppointment?: { doctor?: string; specialty?: string; time?: string };
};

const TILES: Tile[] = [
  { to: "/family/appointments/new", label: "Visits", icon: CalendarBlank },
  { to: "/family/insights", label: "Insights", icon: ChartLineUp },
  { to: "/family/parents", label: "Health", icon: Heartbeat },
];

function Dashboard() {
  const { familyId, name: myName, email } = useAppState();
  const canAccess = useDashboardGuard();
  const { data } = useParents(familyId);
  const parents = (data ?? []) as P[];
  const { selected, select } = useSelectedParent(parents);

  const [dialog, setDialog] = useState<{ kind: ActionKind; name: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [callMode, setCallMode] = useState<"audio" | "video">("audio");
  const [recapOpen, setRecapOpen] = useState(false);

  // Keep the swipe carousel and the top-left switcher in sync.
  const car = useRef<HTMLDivElement>(null);
  const idx = Math.max(0, parents.findIndex((p) => p.id === selected?.id));
  useEffect(() => {
    const el = car.current;
    if (!el || !el.children[idx]) return;
    const target = idx * ((el.children[0] as HTMLElement).offsetWidth + 14);
    if (Math.abs(el.scrollLeft - target) > 8) el.scrollTo({ left: target, behavior: "smooth" });
  }, [idx, parents.length]);
  const onScroll = () => {
    const el = car.current;
    if (!el || parents.length < 2) return;
    const w = (el.children[0] as HTMLElement).offsetWidth + 14;
    const i = Math.min(parents.length - 1, Math.max(0, Math.round(el.scrollLeft / w)));
    if (parents[i].id !== selected?.id) select(parents[i].id);
  };

  if (!canAccess) return null;
  if (!data) return <Screen topbar={<FamilyTopBar />} title="Home" subtitle="Loading…"><div /></Screen>;

  if (!selected) {
    return (
      <Screen topbar={<FamilyTopBar />} title="Home" subtitle="Link a parent to see their day">
        <div className="card-bz rounded-3xl p-5 mt-2 text-center">
          <p className="text-muted-foreground text-sm">No parents are linked to your family yet.</p>
        </div>
      </Screen>
    );
  }

  const first = selected.name.split(" ")[0];
  const contact: CallContact = { name: selected.name, emoji: "", relation: "Parent" };

  const nudge = async () => {
    const wait = nudgeCooldown(selected.id);
    if (wait) { toast(`Already nudged. Try again in ${Math.ceil(wait / 60)} min`); return; }
    try {
      await sendNudge({ familyId, parentId: selected.id, fromName: myName, email });
      toast.success(`Nudge sent to ${first}`);
    } catch { toast.error("Couldn't send the nudge. Try again."); }
  };

  const actions: { icon: Icon; label: string; run: () => void }[] = [
    { icon: Phone, label: "Call", run: () => { setCallMode("audio"); setCallOpen(true); } },
    { icon: VideoCamera, label: "Video call", run: () => { setCallMode("video"); setCallOpen(true); } },
    { icon: BellRinging, label: "Nudge to call", run: nudge },
    { icon: ChatCircle, label: "Message", run: () => { setDialog({ kind: "text", name: selected.name }); setDialogOpen(true); } },
    { icon: MapPin, label: "Locate", run: () => {
      setMediaItem({ kind: "photo", from: selected.name, emoji: "📍", time: selected.lastSeen, caption: "Live location · Home", gradient: "from-emerald-200 via-teal-200 to-sky-200", scene: "🗺️📍" });
      setMediaOpen(true);
    } },
  ];

  const med = selected.nextMedicine;
  const appt = selected.nextAppointment;

  return (
    <Screen topbar={<FamilyTopBar />} title="Home" subtitle={`${first}'s day at a glance`}>
      <div className="space-y-4">
        <div ref={car} onScroll={onScroll} className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 py-2" aria-label="Parents">
          {parents.map((p) => <ParentSlide key={p.id} p={p} />)}
        </div>
        {parents.length > 1 && (
          <div className="flex justify-center gap-1.5 -mt-1" aria-hidden>
            {parents.map((p, i) => (
              <span key={p.id} className={cn("h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]", i === idx ? "w-5 bg-primary" : "w-1.5 bg-foreground/15")} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2">
          <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-medium", selected.status === "safe" ? "text-primary" : "text-[oklch(0.55_0.13_65)]")}>
            <span className={cn("w-2 h-2 rounded-full", selected.status === "safe" ? "bg-success" : "bg-warning")} />
            {selected.status === "safe" ? "Safe" : "Needs attention"} · {selected.lastSeen}
          </span>
          <CheckInChip parentId={selected.id} />
          <ThereTime timeZone={selected.timezone} />
        </div>

        <div className="flex justify-between px-2">
          {actions.map(({ icon: Icon, label, run }) => (
            <button key={label} onClick={run} aria-label={`${label} ${first}`}
              className="glass w-[52px] h-[52px] rounded-full grid place-items-center text-primary active:scale-95 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <Icon size={23} weight="light" />
            </button>
          ))}
        </div>

        <RecapPill text={`${first}'s week in one read`} onOpen={() => setRecapOpen(true)} />

        <section className="card-bz rounded-3xl p-4 divide-y divide-border" aria-label="Coming up">
          <div className="flex items-center gap-3 pb-3">
            <span className="w-10 h-10 rounded-[14px] bg-warning/25 text-[oklch(0.5_0.12_65)] grid place-items-center"><Clock size={21} weight="light" /></span>
            <div className="min-w-0">
              <div className="text-[15.5px] font-semibold truncate">{med?.name ? `${med.name}${med.dose ? ` · ${med.dose}` : ""}` : selected.medsPending ? `${selected.medsPending} medicine pending` : "All medicines taken"}</div>
              <div className="text-[12.5px] text-muted-foreground">{med?.time ? `Next dose ${med.time}` : "Nothing due right now"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3">
            <span className="w-10 h-10 rounded-[14px] bg-primary/12 text-primary grid place-items-center"><CalendarBlank size={21} weight="light" /></span>
            <div className="min-w-0">
              <div className="text-[15.5px] font-semibold truncate">{appt?.doctor ? `${appt.doctor}${appt.time ? ` · ${appt.time}` : ""}` : "No visit scheduled"}</div>
              <div className="text-[12.5px] text-muted-foreground">{appt?.specialty ?? "Add one from Visits"}</div>
            </div>
          </div>
        </section>

        <TileGrid tiles={TILES} />
      </div>

      <RecapFor p={selected} open={recapOpen} onOpenChange={setRecapOpen} />
      {dialog && <ActionDialog open={dialogOpen} onOpenChange={setDialogOpen} kind={dialog.kind} contactName={dialog.name} emoji="" />}
      <CallDialog open={callOpen} onOpenChange={setCallOpen} contact={contact} direction="outgoing" mode={callMode} />
      <MediaViewerDialog open={mediaOpen} onOpenChange={setMediaOpen} item={mediaItem} />
    </Screen>
  );
}

function ParentSlide({ p }: { p: P }) {
  const vitals = useVitals(p.id);
  return (
    <div className="snap-center shrink-0 basis-[91%]">
      <PersonHero name={p.name} age={p.age} photoUrl={p.photoUrl} vitals={vitals} online={p.status === "safe"} />
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2.5 px-3">
        <Heartbeat size={14} weight="light" /> {p.device ? `${p.device} · synced just now` : "Health data from their phone"}
      </div>
    </div>
  );
}

function RecapFor({ p, open, onOpenChange }: { p: P; open: boolean; onOpenChange: (v: boolean) => void }) {
  const vitals = useVitals(p.id);
  const first = p.name.split(" ")[0];
  const ok = p.status === "safe";
  // ponytail: summary composed from live numbers; swap for a model call once the server key exists.
  const summary = `${first}'s wellness score is ${p.wellness} out of 100. ${p.medsPending ? `${p.medsPending} medicine${p.medsPending > 1 ? "s are" : " is"} still pending. ` : "All medicines are taken. "}${first} has walked ${p.steps.toLocaleString()} steps and slept ${p.sleep}. Phone battery is at ${p.battery}%.`;
  return (
    <RecapSheet
      open={open}
      onOpenChange={onOpenChange}
      who={p.name}
      summary={summary}
      sleep={vitals.find((v) => v.key === "sleep")?.value && vitals.find((v) => v.key === "sleep")?.value !== "—" ? `${vitals.find((v) => v.key === "sleep")?.value} last night` : p.sleep}
      vitalsNote={ok ? "All readings look steady" : "A few readings need a look"}
    />
  );
}
