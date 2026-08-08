import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Button } from "@/components/ui/button";
import { ShieldAlert, MapPin, Phone, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAppState } from "@/lib/app-state";
import { useFamilyMembers } from "@/lib/queries/use-family-members";

export const Route = createFileRoute("/sos")({
  head: () => ({ meta: [{ title: "Emergency — myFamily" }] }),
  component: SOS,
});

const HOLD_MS = 3000;

function SOS() {
  const navigate = useNavigate();
  const { familyId, email, parentId, name } = useAppState();
  const { data: members } = useFamilyMembers(familyId);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const raf = useRef<number | null>(null);
  const start = useRef<number>(0);

  // Emergency contact = the first family member who is NOT the current user.
  const contact =
    members?.find((m: any) => m.user_id !== parentId && m.name !== name)?.name ??
    members?.[0]?.name ??
    "your family";

  const stopHold = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setHolding(false);
    setProgress(0);
  };

  const tick = () => {
    const p = Math.min(1, (Date.now() - start.current) / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      stopHold();
      setTriggered(true);
      toast.error("Emergency triggered. Family notified.");
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };

  const beginHold = () => {
    if (triggered) return;
    setHolding(true);
    start.current = Date.now();
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  return (
    <PhoneFrame>
      <div className={`flex-1 flex flex-col items-center justify-center px-6 text-center ${triggered ? "bg-destructive text-destructive-foreground" : "bg-background"}`}>
        {!triggered ? (
          <>
            <button
              type="button"
              onPointerDown={beginHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              aria-label="Press and hold to trigger emergency"
              className="w-44 h-44 rounded-full bg-destructive/10 grid place-items-center select-none touch-none"
            >
              <div
                className="w-36 h-36 rounded-full bg-destructive grid place-items-center text-destructive-foreground transition-transform"
                style={{ transform: `scale(${1 + progress * 0.08})` }}
              >
                <ShieldAlert className="w-16 h-16" />
              </div>
            </button>
            <h1 className="text-2xl font-bold mt-8">{holding ? "Keep holding…" : "Emergency SOS"}</h1>
            <p className="text-muted-foreground mt-2 max-w-xs">
              Press and hold the button for 3 seconds to notify your family, share your live location, and start emergency recording.
            </p>
            {holding && (
              <div className="mt-6 w-full max-w-xs h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-destructive transition-[width] duration-75" style={{ width: `${progress * 100}%` }} />
              </div>
            )}
            <Button variant="secondary" className="mt-10 h-14 px-10 rounded-2xl text-base" onClick={() => navigate({ to: "/parent/home" })}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <ShieldAlert className="w-24 h-24" />
            <h1 className="text-3xl font-bold mt-6">Help is on the way</h1>
            <p className="opacity-90 mt-2">Family notified · Location shared · Recording</p>
            <div className="mt-8 space-y-3 w-full max-w-xs">
              <Row icon={<Phone className="w-5 h-5" />} label={`Calling ${contact}…`} />
              <Row icon={<MapPin className="w-5 h-5" />} label="Live location shared" />
              <Row icon={<Mic className="w-5 h-5" />} label="Emergency audio recording" />
            </div>
            <Button variant="secondary" className="mt-10 h-14 px-10 rounded-2xl text-base" onClick={() => navigate({ to: "/parent/home" })}>
              I'm safe now
            </Button>
          </>
        )}
      </div>
    </PhoneFrame>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3 text-left">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}
