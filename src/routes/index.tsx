import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useHydrated } from "@/lib/app-state";
import { getNextAuthRoute } from "@/lib/redirect-utils";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "myFamily — Care for the ones who cared for you" },
      { name: "description", content: "myFamily helps elderly parents stay independent while family coordinates care remotely. Medicine reminders, SOS, AI companion, and health insights." },
      { property: "og:title", content: "myFamily — Care, together" },
      { property: "og:description", content: "Independence for parents. Peace of mind for family." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      const nextRoute = getNextAuthRoute();
      navigate({ to: nextRoute });
    }, 700);
    return () => clearTimeout(t);
  }, [hydrated, navigate]);

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-8">
        <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center">
          <Heart className="w-12 h-12 text-primary" strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">myFamily</h1>
          <p className="mt-3 text-muted-foreground text-base max-w-[280px]">
            Care for the ones who cared for you.
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
