import { Heart, Pill, Users, AlertTriangle, Sparkles, Settings } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function ParentEmptyHome({ firstName = "there" }: { firstName?: string }) {
  const navigate = useNavigate();
  const t = useT();

  const steps = [
    {
      icon: <Pill className="w-6 h-6 text-blue-500" />,
      title: "Add your first medicine",
      description: "Scan the strip or box — we'll set the reminders for you.",
      cta: "Scan medicine",
      route: "/parent/medicine/scan",
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Connect your family",
      description: "Invite a son, daughter or spouse so they can help remotely.",
      cta: "Invite family",
      route: "/parent/family",
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-destructive" />,
      title: "Set up emergency SOS",
      description: "One tap alerts everyone in your circle with your location.",
      cta: "Review SOS",
      route: "/sos",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-warning" />,
      title: "Say hello to your companion",
      description: "Ask about medicines, weather or just have a chat.",
      cta: "Try it",
      route: "/parent/ai",
    },
    {
      icon: <Settings className="w-6 h-6 text-muted-foreground" />,
      title: "Make it comfortable to read",
      description: "Bigger text, high contrast and your preferred language.",
      cta: "Adjust settings",
      route: "/parent/profile",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <SoftCard className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-900 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-[20px] bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Your day is empty
        </h2>
        <p className="text-sm text-muted-foreground">
          Nothing scheduled yet. Add a medicine or invite your family and today's card will fill up on its own.
        </p>
      </SoftCard>

      {/* Finish setting up */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-lg font-semibold">Finish setting up</h3>
          <span className="text-sm text-muted-foreground">0 of 5 done</span>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <SoftCard key={step.route} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-card flex items-center justify-center">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-foreground">
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                  <Button
                    variant="link"
                    className="text-primary h-auto p-0 mt-3 font-semibold"
                    onClick={() => navigate({ to: step.route })}
                  >
                    {step.cta} →
                  </Button>
                </div>
              </div>
            </SoftCard>
          ))}
        </div>
      </div>

      {/* Explore with sample data */}
      <SoftCard className="border-2 border-dashed border-muted bg-muted/30 p-4 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Just looking around?
        </p>
        <Button
          variant="outline"
          className="w-full rounded-2xl"
          onClick={() => {
            // Toggle demo data
            localStorage.setItem("myfamily.demo", "true");
            window.location.reload();
          }}
        >
          Explore with sample data
        </Button>
      </SoftCard>
    </div>
  );
}
