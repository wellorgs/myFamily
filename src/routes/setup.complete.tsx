import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { useSetupStore } from "@/lib/setup-store";
import { getStepsForRole } from "@/lib/setup-steps";
import { Check, Heart, Pill, Users, Zap, Settings, LineChart, Clock } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/setup/complete")({
  head: () => ({
    meta: [
      { title: "Setup complete — myFamily" },
      { name: "description", content: "You're all set! Explore what's next." },
    ],
  }),
  component: SetupComplete,
});

function SetupComplete() {
  const navigate = useNavigate();
  const { role, parentId, name } = useAppState();
  const setupStore = useSetupStore(parentId);
  const t = useT();
  const steps = getStepsForRole((role as "parent" | "family") || "parent");

  const isParent = role === "parent";

  // Next action cards per role
  const nextActions = isParent
    ? [
        {
          icon: <Heart className="w-6 h-6 text-destructive" />,
          title: "Health check-in",
          description: "Log your daily readings",
          route: "/parent/health",
        },
        {
          icon: <Zap className="w-6 h-6 text-warning" />,
          title: "AI companion",
          description: "Chat with your health assistant",
          route: "/parent/ai",
        },
        {
          icon: <Users className="w-6 h-6 text-primary" />,
          title: "Family circle",
          description: "Connect with loved ones",
          route: "/parent/family",
        },
        {
          icon: <Settings className="w-6 h-6 text-muted-foreground" />,
          title: "Customize settings",
          description: "Make the app comfortable to use",
          route: "/parent/profile",
        },
      ]
    : [
        {
          icon: <LineChart className="w-6 h-6 text-primary" />,
          title: "Insights",
          description: "Monitor parent's health trends",
          route: "/family/insights",
        },
        {
          icon: <Pill className="w-6 h-6 text-blue-500" />,
          title: "Medicines",
          description: "Track medication adherence",
          route: "/family/medicines",
        },
        {
          icon: <Clock className="w-6 h-6 text-amber-500" />,
          title: "Call log",
          description: "See your communication history",
          route: "/calls",
        },
        {
          icon: <Settings className="w-6 h-6 text-muted-foreground" />,
          title: "Plan & settings",
          description: "Choose your plan and preferences",
          route: "/family/profile",
        },
      ];

  return (
    <Screen
      title={isParent ? "You're all set!" : "Setup complete!"}
      subtitle=""
    >
      <div className="space-y-6">
        {/* Celebration card */}
        <SoftCard className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-900 p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
            Welcome!
          </h2>
          <p className="text-sm text-green-800 dark:text-green-200">
            {isParent
              ? "Your family can now help coordinate your care."
              : "You're ready to support your family's health journey."}
          </p>
        </SoftCard>

        {/* Completed steps recap */}
        <div>
          <h3 className="text-lg font-semibold mb-3 px-1">
            What you completed
          </h3>
          <SoftCard className="p-0 divide-y">
            <div className="px-4 py-2 bg-muted/50">
              <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                {steps.length} steps completed
              </div>
            </div>
            <ul>
              {steps.map((step) => (
                <li
                  key={step.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {step.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </SoftCard>
        </div>

        {/* What's next */}
        <div>
          <h3 className="text-lg font-semibold mb-3 px-1">
            What's next?
          </h3>
          <div className="space-y-3">
            {nextActions.map((action) => (
              <Link
                key={action.route}
                to={action.route}
                className="block"
              >
                <SoftCard className="flex items-start gap-4 hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-card flex items-center justify-center">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">
                      {action.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-muted-foreground">
                    →
                  </div>
                </SoftCard>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4">
          <Button
            onClick={() => {
              navigate({
                to: isParent ? "/parent/home" : "/family/dashboard",
              });
            }}
            className="w-full h-12 rounded-2xl text-base"
          >
            {isParent ? "Go to my home" : "Go to my dashboard"}
          </Button>
        </div>
      </div>
    </Screen>
  );
}
