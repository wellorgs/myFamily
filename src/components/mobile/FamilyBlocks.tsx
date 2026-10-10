import { useState } from "react";
import { toast } from "sonner";
import { BellRing, CheckCircle2, Clock, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCheckIn } from "@/lib/queries/use-checkin";
import { nudgeCooldown, sendNudge } from "@/lib/nudge";

/** One-line answer to "is everyone okay?" for the whole family. */
export function FamilyStatusBanner({ parents }: { parents: readonly { status: string }[] }) {
  const attention = parents.filter((p) => p.status !== "safe").length;
  const ok = attention === 0;
  const Icon = ok ? ShieldCheck : TriangleAlert;
  return (
    <div className={cn("glass rounded-[28px] p-4 flex items-center gap-3", ok ? "bg-tint-green/60" : "bg-tint-amber/70")} role="status">
      <span className={cn("w-11 h-11 rounded-2xl grid place-items-center", ok ? "bg-primary/15 text-primary" : "bg-warning/30 text-foreground")}>
        <Icon className="w-6 h-6" />
      </span>
      <div>
        <div className="font-semibold text-[17px]">{ok ? "Everyone is okay" : `${attention} need${attention > 1 ? "" : "s"} attention`}</div>
        <div className="text-sm text-muted-foreground">{parents.length} {parents.length === 1 ? "parent" : "parents"} in your circle</div>
      </div>
    </div>
  );
}

/** Daily "I'm okay" status for a parent, as set from the parent app. */
export function CheckInChip({ parentId }: { parentId: string }) {
  const { data } = useCheckIn(parentId);
  if (data === undefined) return null;
  return data ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-semibold">
      <CheckCircle2 className="w-3 h-3" /> Checked in · {data}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning/25 px-2 py-0.5 text-[11px] font-semibold">
      <Clock className="w-3 h-3" /> No check-in yet today
    </span>
  );
}

/** Parent's local time, only when it differs from the viewer's (the NRI case). */
export function ThereTime({ timeZone }: { timeZone?: string }) {
  const tz = timeZone || "Asia/Kolkata";
  const mine = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz === mine) return null;
  try {
    const t = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit", timeZone: tz }).format(new Date());
    return <span className="text-[11px] text-muted-foreground">{t} there</span>;
  } catch { return null; }
}

/** "Nudge": a gentle prompt for the parent to call back. 10-minute cooldown per parent. */
export function NudgeButton({ parentId, parentName, familyId, fromName, email }: {
  parentId: string; parentName: string; familyId: string; fromName: string; email: string;
}) {
  const [busy, setBusy] = useState(false);
  const go = async () => {
    const wait = nudgeCooldown(parentId);
    if (wait) { toast(`Already nudged. Try again in ${Math.ceil(wait / 60)} min`); return; }
    setBusy(true);
    try {
      await sendNudge({ familyId, parentId, fromName, email });
      toast.success(`Nudge sent to ${parentName.split(" ")[0]}`);
    } catch { toast.error("Couldn't send the nudge. Try again."); }
    finally { setBusy(false); }
  };
  return (
    <Button variant="secondary" className="h-10 rounded-2xl px-0" onClick={go} disabled={busy} aria-label={`Nudge ${parentName} to call`}>
      <BellRing className="w-4 h-4" />
    </Button>
  );
}
