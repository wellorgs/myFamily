import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [
    { title: "Plans & pricing — myFamily" },
    { name: "description", content: "Choose a plan that fits your family — free forever, or unlock advanced AI, phone analytics, and unlimited members." },
  ] }),
  component: Pricing,
});

const plans = [
  {
    key: "free",
    name: "Free",
    price: { m: "$0", y: "$0" },
    tag: "Get started",
    tone: "neutral" as const,
    features: [
      "1 Parent · 1 Family member",
      "Medicine reminders",
      "Appointments",
      "SOS button",
      "Basic AI assistant",
      "Health timeline",
      "Basic notifications",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: { m: "$9.99", y: "$99" },
    tag: "Most popular",
    tone: "blue" as const,
    highlight: true,
    features: [
      "Unlimited family members",
      "Unlimited medicines",
      "Advanced AI + voice companion",
      "Health insights & weekly reports",
      "Mood + phone analytics",
      "Priority support",
      "Wearable sync",
      "Medical report scanner",
      "AI memory",
      "Emergency monitoring",
    ],
  },
  {
    key: "family+",
    name: "Family Plus",
    price: { m: "$19.99", y: "$199" },
    tag: "For big families",
    tone: "purple" as const,
    features: [
      "Everything in Premium",
      "Multiple parents",
      "Doctor portal",
      "Professional caregiver access",
      "Advanced analytics",
      "Unlimited AI",
      "Shared family dashboard",
      "Priority emergency routing",
      "Smart device integrations",
    ],
  },
];

function Pricing() {
  const [cycle, setCycle] = useState<"m" | "y">("m");
  return (
    <PhoneFrame>
      <Screen title="Plans & pricing" back={true} subtitle="Peace of mind at every level.">
        <div className="flex items-center justify-center mb-5">
          <div className="inline-flex bg-muted rounded-full p-1">
            <button onClick={() => setCycle("m")} className={`px-4 h-9 rounded-full text-sm font-medium ${cycle === "m" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>Monthly</button>
            <button onClick={() => setCycle("y")} className={`px-4 h-9 rounded-full text-sm font-medium ${cycle === "y" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>Yearly · save 17%</button>
          </div>
        </div>
        <div className="space-y-4">
          {plans.map((p) => (
            <SoftCard key={p.key} tone={p.tone} className={p.highlight ? "ring-2 ring-primary" : ""}>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{p.tag}</div>
                  <div className="text-2xl font-bold mt-0.5">{p.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{p.price[cycle]}</div>
                  <div className="text-xs text-muted-foreground">/{cycle === "m" ? "month" : "year"}</div>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full h-12 rounded-2xl mt-5"
                variant={p.highlight ? "default" : "secondary"}
                onClick={() => toast.success(`${p.name} selected`)}
              >
                {p.key === "free" ? "Current plan" : `Choose ${p.name}`}
              </Button>
            </SoftCard>
          ))}
        </div>
      </Screen>
    </PhoneFrame>
  );
}
