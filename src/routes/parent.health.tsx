import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Heart, Activity, Moon, Droplets, Footprints, Pill } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAppState } from "@/lib/app-state";
import { isMockAccount } from "@/lib/account-utils";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { firebaseApp } from "@/integrations/firebase/client";

const READING_TYPES = ["Blood pressure", "Sugar (fasting)", "Heart rate", "Weight"];

export const Route = createFileRoute("/parent/health")({
  head: () => ({
    meta: [
      { title: "Health — myFamily" },
      { name: "description", content: "Track your health readings and trends." },
    ],
  }),
  component: Health,
});

function Health() {
  const { parentId, email } = useAppState();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(READING_TYPES[0]);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLog = async () => {
    if (!value.trim()) {
      toast.error("Enter a value.");
      return;
    }
    setSaving(true);
    try {
      if (!isMockAccount(email)) {
        const db = getFirestore(firebaseApp);
        await addDoc(collection(db, "vitals"), {
          parentId,
          type,
          value: value.trim(),
          createdAt: serverTimestamp(),
        });
      }
      toast.success(`${type} logged.`);
      setValue("");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const readings = [
    {
      icon: <Heart className="w-6 h-6 text-destructive" />,
      label: "BLOOD PRESSURE",
      value: "122 / 78",
      unit: "mmHg",
      tone: "green" as const,
    },
    {
      icon: <Activity className="w-6 h-6 text-success" />,
      label: "SUGAR (FASTING)",
      value: "104",
      unit: "mg/dL",
      tone: "green" as const,
    },
    {
      icon: <Heart className="w-6 h-6 text-primary" />,
      label: "HEART RATE",
      value: "72",
      unit: "bpm",
      tone: "green" as const,
    },
    {
      icon: <Activity className="w-6 h-6 text-muted-foreground" />,
      label: "WEIGHT",
      value: "68.4",
      unit: "kg",
      tone: "neutral" as const,
    },
    {
      icon: <Moon className="w-6 h-6 text-primary" />,
      label: "SLEEP",
      value: "7h 20m",
      unit: "last night",
      tone: "green" as const,
    },
    {
      icon: <Droplets className="w-6 h-6 text-warning" />,
      label: "HYDRATION",
      value: "4 / 8",
      unit: "glasses",
      tone: "amber" as const,
    },
    {
      icon: <Footprints className="w-6 h-6 text-warning" />,
      label: "WALKING",
      value: "1,820",
      unit: "steps",
      tone: "amber" as const,
    },
    {
      icon: <Pill className="w-6 h-6 text-success" />,
      label: "MEDICINE",
      value: "92%",
      unit: "this week",
      tone: "green" as const,
    },
  ];

  return (
    <Screen
      title="Health"
      subtitle="Simple, clear, always with you."
    >
      <div className="space-y-6">
        {/* Sparkline chart */}
        <SoftCard className="p-6">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-4">
            THIS WEEK
          </div>
          <h3 className="text-lg font-semibold mb-6">Steps trend</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {[4200, 3800, 4500, 3200, 5100, 4700, 4200].map((val, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full bg-primary rounded-t-lg transition-all"
                  style={{ height: `${(val / 5500) * 100}%` }}
                  aria-label={`${val} steps`}
                />
                <span className="text-xs text-muted-foreground">
                  {["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"][i]}
                </span>
              </div>
            ))}
          </div>
        </SoftCard>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {readings.map((reading) => (
            <SoftCard
              key={reading.label}
              className="p-4 flex flex-col"
              tone={reading.tone}
            >
              <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                {reading.label}
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {reading.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {reading.unit}
              </div>
            </SoftCard>
          ))}
        </div>

        {/* Log reading CTA */}
        <Button className="w-full h-12 rounded-2xl text-base" onClick={() => setOpen(true)}>
          Log a reading
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a reading</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-12 w-full rounded-2xl mt-1 border border-input bg-background px-3 text-sm"
              >
                {READING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Value</Label>
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 122/78" className="h-12 rounded-2xl mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full h-12 rounded-2xl" disabled={saving} onClick={handleLog}>
              {saving ? "Saving…" : "Save reading"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Screen>
  );
}
