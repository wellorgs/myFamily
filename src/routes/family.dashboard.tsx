import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard, StatusDot } from "@/components/mobile/Card";
import { useAppState } from "@/lib/app-state";
import { useParents } from "@/lib/queries/use-parents";
import { useAlerts } from "@/lib/queries/use-alerts";
import { Bell, BatteryFull, Footprints, Pill, Moon, Calendar, HeartPulse, Phone, MessageSquare, ShieldAlert, Video, PhoneIncoming, PhoneCall } from "lucide-react";
import { NotificationBell } from "@/components/mobile/NotificationBell";
import { useState } from "react";
import { ActionDialog, type ActionKind } from "@/components/mobile/ActionDialog";
import { MediaViewerDialog, type MediaItem } from "@/components/mobile/MediaViewerDialog";
import { CallDialog, type CallContact } from "@/components/mobile/CallDialog";
import { Button } from "@/components/ui/button";
import { ActivityStrip } from "@/components/mobile/ActivityStrip";
import { useDashboardGuard } from "@/lib/route-guards";

export const Route = createFileRoute("/family/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — myFamily" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { familyId } = useAppState();
  const canAccess = useDashboardGuard();
  const { data: parents } = useParents(familyId);
  const { data: alerts } = useAlerts(familyId);
  const [dialog, setDialog] = useState<{ kind: ActionKind; name: string; emoji: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [callContact, setCallContact] = useState<CallContact | null>(null);
  const [callDir, setCallDir] = useState<"incoming" | "outgoing">("outgoing");
  const [callMode, setCallMode] = useState<"audio" | "video">("audio");

  if (!canAccess || !parents || !alerts) return null;

  const openCall = (id: string, mode: "audio" | "video" = "audio", direction: "incoming" | "outgoing" = "outgoing") => {
    const p = parents.find((x) => x.id === id)!;
    setCallContact({ name: p.name, emoji: id === "mom" ? "👩🏽‍🦳" : "👴🏽", relation: id === "mom" ? "Mom" : "Dad" });
    setCallDir(direction);
    setCallMode(mode);
    setCallOpen(true);
  };
  const openAction = (kind: ActionKind, id: string) => {
    const p = parents.find((x) => x.id === id)!;
    setDialog({ kind, name: p.name, emoji: id === "mom" ? "👩🏽‍🦳" : "👴🏽" });
    setDialogOpen(true);
  };
  const openAlert = (a: (typeof alerts)[number]) => {
    setMediaItem({
      kind: "text",
      from: a.title,
      emoji: a.tone === "amber" ? "⚠️" : a.tone === "blue" ? "🔔" : "✅",
      time: a.time,
      body: a.title.includes("battery")
        ? "Dad's phone is at 42% and dropping. Consider a gentle reminder to plug it in."
        : a.title.includes("missed")
        ? "Atorvastatin 10 mg scheduled for 9:00 PM. Two reminders sent. Tap Call to check in."
        : "Great work! Mom's evening loop covered 3,200 steps at a steady pace.",
    });
    setMediaOpen(true);
  };

  return (
    <Screen
      title="Dashboard"
      subtitle="Everyone at a glance"
      right={
        <NotificationBell />

      }
    >
      <div className="space-y-3">
        {parents.map((p) => (
          <SoftCard key={p.id} tone={p.status === "safe" ? "green" : "amber"}>
            <Link to="/family/parents/$id" params={{ id: p.id }} className="block">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-card grid place-items-center text-2xl">{p.id === "mom" ? "👩🏽‍🦳" : "👴🏽"}</div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{p.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <StatusDot tone={p.status === "safe" ? "green" : "amber"} />
                    {p.status === "safe" ? "Safe" : "Needs attention"} · {p.lastSeen}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{p.wellness}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Wellness</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <Mini icon={<Pill className="w-4 h-4" />} label={p.medsPending ? `${p.medsPending} pending` : "All taken"} />
                <Mini icon={<Footprints className="w-4 h-4" />} label={`${p.steps.toLocaleString()}`} />
                <Mini icon={<Moon className="w-4 h-4" />} label={p.sleep} />
                <Mini icon={<BatteryFull className="w-4 h-4" />} label={`${p.battery}%`} />
              </div>
            </Link>
            <div className="grid grid-cols-4 gap-2 mt-3">
              <Button variant="secondary" className="h-10 rounded-2xl px-0" onClick={() => openCall(p.id, "audio")} aria-label={`Call ${p.name}`}><Phone className="w-4 h-4" /></Button>
              <Button variant="secondary" className="h-10 rounded-2xl px-0" onClick={() => openCall(p.id, "video")} aria-label={`Video call ${p.name}`}><Video className="w-4 h-4" /></Button>
              <Button variant="secondary" className="h-10 rounded-2xl px-0" onClick={() => openAction("text", p.id)} aria-label={`Message ${p.name}`}><MessageSquare className="w-4 h-4" /></Button>
              <Button variant="secondary" className="h-10 rounded-2xl px-0" onClick={() => {
                setMediaItem({ kind: "photo", from: p.name, emoji: p.id === "mom" ? "👩🏽‍🦳" : "👴🏽", time: p.lastSeen, caption: "Live location · Home", gradient: "from-emerald-200 via-teal-200 to-sky-200", scene: "🗺️📍" });
                setMediaOpen(true);
              }} aria-label={`Locate ${p.name}`}><ShieldAlert className="w-4 h-4" /></Button>
            </div>
          </SoftCard>
        ))}

        <h2 className="text-lg font-semibold mt-4 mb-1 px-1">Alerts</h2>
        <SoftCard className="p-2">
          <ul className="divide-y">
            {alerts.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => openAlert(a)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <StatusDot tone={a.tone as any} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.time}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </SoftCard>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Link to="/calls"><Quick icon={<PhoneCall className="w-5 h-5" />} label="Recent calls" /></Link>
          <Link to="/family/medicines"><Quick icon={<Pill className="w-5 h-5" />} label="Medicines" /></Link>
          <Link to="/family/appointments/new"><Quick icon={<Calendar className="w-5 h-5" />} label="Appointments" /></Link>
          <Link to="/family/insights"><Quick icon={<HeartPulse className="w-5 h-5" />} label="Insights" /></Link>
        </div>

        <button
          onClick={() => openCall("dad", "audio", "incoming")}
          className="mt-4 w-full h-11 rounded-2xl bg-muted/60 hover:bg-muted text-sm font-medium flex items-center justify-center gap-2 text-muted-foreground"
        >
          <PhoneIncoming className="w-4 h-4" /> Simulate incoming call from Dad
        </button>

        <ActivityStrip />
      </div>
      {dialog && (
        <ActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          kind={dialog.kind}
          contactName={dialog.name}
          emoji={dialog.emoji}
        />
      )}
      <CallDialog
        open={callOpen}
        onOpenChange={setCallOpen}
        contact={callContact}
        direction={callDir}
        mode={callMode}
      />
      <MediaViewerDialog open={mediaOpen} onOpenChange={setMediaOpen} item={mediaItem} />
    </Screen>
  );
}

function Mini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-card px-2 py-2 flex flex-col items-center gap-1 text-center">
      <div className="text-muted-foreground">{icon}</div>
      <div className="text-xs font-medium truncate w-full">{label}</div>
    </div>
  );
}

function Quick({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <SoftCard className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center">{icon}</div>
      <div className="font-medium">{label}</div>
    </SoftCard>
  );
}
