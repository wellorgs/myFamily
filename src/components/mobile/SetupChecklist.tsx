import { Check } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { useSetupStore, type Role } from "@/lib/setup-store";
import { getStepsForRole } from "@/lib/setup-steps";
import { SoftCard } from "@/components/mobile/Card";

interface SetupChecklistProps {
  onStepClick?: (route: string) => void;
  onStepToggle?: (stepId: string, done: boolean) => void;
}

export function SetupChecklist({ onStepClick, onStepToggle }: SetupChecklistProps) {
  const { role, parentId } = useAppState();
  const setupStore = useSetupStore(parentId);

  const steps = getStepsForRole((role as Role) || "parent");

  return (
    <SoftCard className="p-0 divide-y overflow-hidden">
      <div className="px-4 py-3 bg-muted/50">
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Setup Checklist
        </div>
      </div>
      <ul className="divide-y">
        {steps.map((step, idx) => {
          const isDone = setupStore.isStepDone(step.id);

          return (
            <li key={step.id} className="flex items-center gap-3 px-4 py-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newState = !isDone;
                  if (newState) {
                    setupStore.markStepDone(step.id);
                  } else {
                    setupStore.markStepUndone(step.id);
                  }
                  onStepToggle?.(step.id, newState);
                }}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                  isDone
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30 hover:border-primary/50"
                }`}
                aria-label={`${isDone ? "Mark incomplete" : "Mark complete"}: ${step.label}`}
              >
                {isDone && <Check className="w-4 h-4 text-primary-foreground m-auto" />}
              </button>

              <button
                onClick={() => onStepClick?.(step.route)}
                className="flex-1 text-left min-w-0 py-1 hover:opacity-70 transition-opacity"
              >
                <div
                  className={`text-sm font-medium transition-all ${
                    isDone ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {idx + 1}. {step.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </SoftCard>
  );
}
