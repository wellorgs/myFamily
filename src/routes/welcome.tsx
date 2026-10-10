import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { HeartPulse, Pill, ShieldAlert } from "lucide-react";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { cn } from "@/lib/utils";
import { markWelcomeSeen } from "@/lib/welcome";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — myFamily" }] }),
  component: Welcome,
});

const SLIDES = [
  {
    title: "Welcome to myFamily",
    body: "A calm care app for parents and the children who love them. Simple for them, complete for you.",
    art: <FamilyArt />,
  },
  {
    title: "Medicines that get taken",
    body: "One card, one big button. When they tap “I took it”, everyone in the family circle sees it.",
    art: <MedicineArt />,
  },
  {
    title: "Help is one tap away",
    body: "If something feels wrong, SOS alerts your whole circle and keeps trying until someone answers.",
    art: <SosArt />,
  },
];

function Welcome() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const finish = () => {
    markWelcomeSeen();
    navigate({ to: "/auth" });
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col px-5 pt-3 pb-8">
        <button onClick={finish} className="self-end text-sm font-medium text-muted-foreground h-10 px-3" aria-label="Skip intro">
          Skip
        </button>

        <div key={i} className="border border-white/70 shadow-soft flex-1 min-h-0 rounded-[40px] overflow-hidden relative grid place-items-center bg-gradient-to-b from-[oklch(0.9_0.08_160)] to-[oklch(0.96_0.05_95)] animate-in fade-in zoom-in-95 duration-300">
          {SLIDES[i].art}
        </div>

        <div className="text-center mt-8 px-2">
          <h1 className="text-[28px] font-bold tracking-tight">{SLIDES[i].title}</h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed max-w-[320px] mx-auto">{SLIDES[i].body}</p>
        </div>

        <button
          onClick={() => (last ? finish() : setI(i + 1))}
          className="mt-8 h-14 rounded-full bg-primary text-primary-foreground text-base font-semibold shadow-lift active:scale-[0.99] transition-transform"
        >
          {last ? "Get started" : "Next"}
        </button>

        <div className="flex justify-center gap-2 mt-5" role="tablist" aria-label="Intro progress">
          {SLIDES.map((_, n) => (
            <span key={n} className={cn("h-2 rounded-full transition-all", n === i ? "w-6 bg-primary" : "w-2 bg-foreground/15")} />
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

function Bubble({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("glass absolute rounded-3xl grid place-items-center", className)}>{children}</div>;
}

function FamilyArt() {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-x-10 top-[18%] bottom-[14%] rounded-[44%] bg-white/40" />
      <div className="absolute inset-0 grid place-items-center text-[88px] leading-none select-none" aria-hidden>
        <span>👵🏽👨🏽‍🦳</span>
      </div>
      <Bubble className="w-16 h-16 left-8 top-[14%]"><HeartPulse className="w-8 h-8 text-primary" /></Bubble>
      <Bubble className="w-14 h-14 right-8 bottom-[22%] text-3xl">💚</Bubble>
      <Bubble className="w-14 h-14 right-12 top-[22%] text-3xl">👩🏽</Bubble>
    </div>
  );
}

function MedicineArt() {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-x-8 top-[26%] glass rounded-3xl p-5 bg-white/70">
        <div className="text-xs font-semibold text-muted-foreground">8:00 AM · after breakfast</div>
        <div className="text-xl font-semibold mt-1">Metformin · 500 mg</div>
        <div className="mt-4 h-12 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">I took it</div>
      </div>
      <Bubble className="w-16 h-16 left-8 top-[10%]"><Pill className="w-8 h-8 text-primary" /></Bubble>
      <Bubble className="px-4 h-12 right-8 bottom-[16%] text-sm font-semibold">Priya got notified ✓</Bubble>
    </div>
  );
}

function SosArt() {
  return (
    <div className="relative w-full h-full grid place-items-center">
      <div className="absolute w-64 h-64 rounded-full bg-destructive/10" />
      <div className="absolute w-44 h-44 rounded-full bg-destructive/15" />
      <div className="relative w-28 h-28 rounded-full bg-destructive text-destructive-foreground grid place-items-center shadow-lift ring-8 ring-white/50">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <Bubble className="px-4 h-12 left-6 bottom-[16%] text-sm font-semibold">Calling Priya…</Bubble>
      <Bubble className="px-4 h-12 right-6 top-[16%] text-sm font-semibold">Location shared</Bubble>
    </div>
  );
}
