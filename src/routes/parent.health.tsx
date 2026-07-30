import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { Heart, Activity, Moon, Droplets, Footprints, Pill } from "lucide-react";

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
        <Button className="w-full h-12 rounded-2xl text-base">
          Log a reading
        </Button>
      </div>
    </Screen>
  );
}
