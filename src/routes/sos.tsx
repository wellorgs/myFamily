import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Button } from "@/components/ui/button";
import { ShieldAlert, MapPin, Phone, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/sos")({
  head: () => ({ meta: [{ title: "Emergency — myFamily" }] }),
  component: SOS,
});

function SOS() {
  const [count, setCount] = useState(5);
  const [triggered, setTriggered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (triggered) return;
    if (count <= 0) {
      setTriggered(true);
      toast.error("Emergency triggered. Family notified.");
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, triggered]);

  return (
    <PhoneFrame>
      <div className={`flex-1 flex flex-col items-center justify-center px-6 text-center ${triggered ? "bg-destructive text-destructive-foreground" : "bg-background"}`}>
        {!triggered ? (
          <>
            <div className="w-40 h-40 rounded-full bg-destructive/10 grid place-items-center animate-pulse">
              <div className="w-32 h-32 rounded-full bg-destructive grid place-items-center text-destructive-foreground">
                <div className="text-6xl font-bold">{count}</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold mt-8">Emergency in {count}s</h1>
            <p className="text-muted-foreground mt-2 max-w-xs">
              We'll notify your family, share your live location, and start emergency recording.
            </p>
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
              <Row icon={<Phone className="w-5 h-5" />} label="Calling Priya (Daughter)…" />
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
