import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle, MoonStars, Phone, Pill, Pulse, Sparkle, Sun } from "@phosphor-icons/react";
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

        <div key={i} className="flex-1 min-h-0 rounded-[40px] overflow-hidden relative grid place-items-center canvas-cream border border-border animate-in fade-in zoom-in-95 duration-500">
          {SLIDES[i].art}
        </div>

        <div className="text-center mt-8 px-2">
          <h1 className="text-[28px] font-bold tracking-tight">{SLIDES[i].title}</h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed max-w-[320px] mx-auto">{SLIDES[i].body}</p>
        </div>

        <button
          onClick={() => (last ? finish() : setI(i + 1))}
          className="mt-8 h-14 rounded-full bg-primary text-primary-foreground text-base font-semibold shadow-[0_10px_22px_-10px_oklch(0.58_0.13_163/0.7)] active:scale-[0.98] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
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

const Tag = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">{children}</div>
);

function FamilyArt() {
  const vitals = [["Heart", "72", "bpm"], ["BP", "128/82", ""], ["Sleep", "7h 10", ""]];
  return (
    <div className="w-full px-6 space-y-3">
      <div className="card-bz rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-primary/12 text-primary grid place-items-center font-display font-bold text-lg">A</span>
          <div className="flex-1">
            <div className="font-semibold text-[16px]">Anita · 68</div>
            <div className="text-[12.5px] text-muted-foreground">Checked in 8:12 AM</div>
          </div>
          <CheckCircle size={24} weight="fill" className="text-primary" />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {vitals.map(([k, v, u]) => (
            <div key={k} className="rounded-2xl bg-muted/70 p-2.5">
              <div className="text-[10.5px] text-muted-foreground">{k}</div>
              <div className="font-display font-bold text-[15px]">{v}<span className="text-[10px] font-medium text-muted-foreground"> {u}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-full h-12 px-4 flex items-center gap-2 w-fit ml-auto text-[13.5px] font-semibold">
        <Sparkle size={18} weight="fill" className="text-primary" />Read the weekly recap
      </div>
    </div>
  );
}

function MedicineArt() {
  return (
    <div className="w-full px-6 space-y-3">
      <div className="card-bz rounded-3xl p-4 space-y-3">
        <Tag>Today · Metformin 500 mg</Tag>
        {[[Sun, "8:00 AM", "After breakfast", true], [MoonStars, "9:00 PM", "After dinner", false]].map(([I, t, f, on]) => {
          const Ic = I as typeof Sun;
          return (
            <div key={t as string} className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-[14px] bg-primary/12 text-primary grid place-items-center"><Ic size={21} weight="light" /></span>
              <div className="flex-1"><div className="font-semibold text-[15px]">{t as string}</div><div className="text-[12.5px] text-muted-foreground">{f as string}</div></div>
              {on ? <CheckCircle size={24} weight="fill" className="text-primary" /> : <span className="text-[12px] font-semibold rounded-full bg-muted px-3 py-1.5">Later</span>}
            </div>
          );
        })}
      </div>
      <div className="glass rounded-full h-12 px-4 flex items-center gap-2 w-fit text-[13.5px] font-semibold"><Pill size={18} weight="light" className="text-primary" />Priya was told: taken</div>
    </div>
  );
}

function SosArt() {
  return (
    <div className="w-full px-6 space-y-3">
      <div className="card-bz rounded-3xl p-5 text-center">
        <span className="mx-auto w-20 h-20 rounded-full bg-destructive text-destructive-foreground grid place-items-center ring-8 ring-destructive/10"><Pulse size={34} weight="light" /></span>
        <div className="font-display font-bold text-[18px] mt-3">SOS sent</div>
        <div className="text-[13px] text-muted-foreground">Location shared with your circle</div>
      </div>
      <div className="card-bz rounded-3xl p-4 divide-y divide-border">
        {[["Priya", "Calling…"], ["Rahul", "Next in line"]].map(([n, s]) => (
          <div key={n} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
            <span className="w-9 h-9 rounded-full bg-primary/12 text-primary grid place-items-center font-bold text-sm">{n[0]}</span>
            <div className="flex-1 font-semibold text-[15px]">{n}</div>
            <span className="text-[12.5px] text-muted-foreground flex items-center gap-1">{s === "Calling…" && <Phone size={14} weight="fill" className="text-primary" />}{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
