import { ChevronRight, AlertCircle, PartyPopper } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { useSetupStore, type Role } from "@/lib/setup-store";
import { getStepsForRole } from "@/lib/setup-steps";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";

interface OnboardingProgressProps {
  onNavigate?: (route: string) => void;
  onClick?: () => void;
}

export function OnboardingProgress({ onNavigate, onClick }: OnboardingProgressProps) {
  const { role, parentId } = useAppState();
  const setupStore = useSetupStore(parentId);

  if (setupStore.status === "loading") {
    return (
      <SoftCard className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </SoftCard>
    );
  }

  const steps = getStepsForRole((role as Role) || "parent");
  const completed = setupStore.getCompletedCount(steps.map((s) => s.id));
  const total = steps.length;
  const isComplete = setupStore.getAllDone(steps.map((s) => s.id));
  const nextStep = steps.find((s) => !setupStore.isStepDone(s.id));

  // Get next step label for aria-label
  const nextStepLabel = nextStep?.label || "Setup complete";
  const progressText = `${completed} of ${total} steps completed`;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (isComplete) {
      onNavigate?.("/setup/complete");
    } else if (nextStep) {
      onNavigate?.(nextStep.route);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setupStore.retry();
  };

  if (setupStore.status === "error") {
    return (
      <SoftCard
        className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={progressText}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider font-semibold text-amber-900 dark:text-amber-100">
              Setup paused
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Couldn't save progress
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-9 shrink-0"
            onClick={handleRetry}
          >
            Retry
          </Button>
        </div>
      </SoftCard>
    );
  }

  const progressPercent = (completed / total) * 100;

  if (isComplete) {
    return (
      <button
        onClick={handleClick}
        className="w-full text-left"
        aria-label="Setup complete. Tap to view summary"
      >
        <SoftCard className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0 animate-bounce">
              <PartyPopper className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider font-semibold text-green-900 dark:text-green-100">
                Setup complete
              </div>
              <div className="text-sm font-semibold text-green-800 dark:text-green-200 mt-1">
                All {total} steps done! 🎉
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-green-600 shrink-0" />
          </div>
        </SoftCard>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left"
      aria-label={`Setup progress: ${progressText}. Next: ${nextStepLabel}`}
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuetext={`${progressText}. ${nextStepLabel}`}
    >
      <SoftCard className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
            {nextStep?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Next step
            </div>
            <div className="text-sm font-semibold text-foreground mt-1">
              {nextStep?.label}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {completed}/{total}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-primary shrink-0" />
        </div>
      </SoftCard>
    </button>
  );
}
