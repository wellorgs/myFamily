import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bed, CaretRight, Drop, Gauge, Heart, PersonSimpleWalk, Sparkle, X, type Icon as PhIcon } from "@phosphor-icons/react";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { useHealthCards } from "@/lib/queries/use-health-cards";
import { cn } from "@/lib/utils";

/* ---------- vitals ---------- */

export type Vital = { key: string; label: string; value: string; unit: string; icon: PhIcon; color: string };

const VITAL_DEFS: { key: string; title: string; label: string; unit: string; icon: PhIcon; color: string }[] = [
  { key: "hr", title: "Heart Rate", label: "Heart", unit: "bpm", icon: Heart, color: "text-primary" },
  { key: "bp", title: "Blood Pressure", label: "Pressure", unit: "mmHg", icon: Gauge, color: "text-primary" },
  { key: "sugar", title: "Sugar (Fasting)", label: "Sugar", unit: "mg/dL", icon: Drop, color: "text-primary" },
  { key: "sleep", title: "Sleep", label: "Sleep", unit: "", icon: Bed, color: "text-primary" },
  { key: "walk", title: "Steps", label: "Steps", unit: "", icon: PersonSimpleWalk, color: "text-primary" },
];

/** Live vitals for one parent. Mock cards are keyed by `title`, Firestore cards by `key`. */
export function useVitals(parentId: string): Vital[] {
  const { data } = useHealthCards(parentId);
  const cards = (data ?? []) as readonly { key?: string; title?: string; value: string }[];
  return VITAL_DEFS.map((d) => {
    const c = cards.find((x) => x.key === d.key || x.title === d.title);
    return { key: d.key, label: d.label, value: c?.value ?? "—", unit: d.unit, icon: d.icon, color: d.color };
  });
}

/* ---------- hero ---------- */

/** Person-first hero: photo (or initial) with a glass name+age pill, vitals as small tiles beside it. */
export function PersonHero({ name, age, photoUrl, vitals, online = true, className }: {
  name: string; age?: number | string; photoUrl?: string; vitals: Vital[]; online?: boolean; className?: string;
}) {
  const first = name.split(" ")[0];
  return (
    <section className={cn("card-bz rounded-3xl p-2.5 flex gap-2.5", className)} aria-label={`${name} summary`}>
      <div className="relative w-[46%] min-h-[196px] rounded-[18px] overflow-hidden bg-gradient-to-b from-[oklch(0.95_0.04_160)] to-[oklch(0.82_0.07_160)] shrink-0">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-display text-[72px] font-bold tracking-tighter text-white/90" aria-hidden>
            {first[0]?.toUpperCase()}
          </span>
        )}
        <span className="glass absolute left-2 right-2 bottom-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold">
          <span className={cn("w-2 h-2 rounded-full shrink-0", online ? "bg-success" : "bg-warning")} />
          <span className="truncate">{first}</span>
          {age !== undefined && <span className="ml-auto text-muted-foreground font-medium">{age}</span>}
        </span>
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-2 gap-1.5 content-start">
        {vitals.slice(0, 5).map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.key} className="rounded-[14px] bg-muted/60 px-2.5 py-2 min-w-0">
              <Icon size={17} weight="light" className={v.color} aria-hidden />
              <div className="font-display text-[15px] font-bold leading-tight mt-1 whitespace-nowrap">{v.value}</div>
              <div className="text-[10px] text-muted-foreground truncate">{v.unit || v.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- AI recap ---------- */

export function RecapPill({ text, onOpen }: { text: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="glass w-full rounded-full px-4 py-3 flex items-center gap-2 text-left min-h-[48px] active:scale-[0.99] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
      aria-label="Read the AI recap"
    >
      <Sparkle size={19} weight="light" className="text-primary shrink-0" />
      <span className="flex-1 text-[13px] text-primary truncate">{text}</span>
      <span className="text-[13px] font-bold text-[oklch(0.58_0.13_70)] shrink-0">Read the recap</span>
    </button>
  );
}

export function RecapSheet({ open, onOpenChange, who, summary, sleep, vitalsNote, week }: {
  open: boolean; onOpenChange: (v: boolean) => void; who: string; summary: string; sleep: string; vitalsNote: string;
  week?: { d: string; v: number }[];
}) {
  const max = Math.max(1, ...(week ?? []).map((w) => w.v));
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-[430px] mx-auto rounded-t-[34px] bg-background px-6 pb-8 pt-4">
        <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 w-9 h-9 rounded-full grid place-items-center text-muted-foreground" aria-label="Close recap">
          <X size={20} weight="light" />
        </button>
        <div className="mx-auto w-[60px] h-[60px] rounded-full bg-[radial-gradient(circle_at_30%_25%,oklch(0.8_0.14_160),oklch(0.58_0.13_163))] text-white grid place-items-center mt-3 shadow-[0_12px_24px_-8px_oklch(0.58_0.13_163/0.6)]">
          <Sparkle size={28} weight="light" />
        </div>
        <DrawerTitle className="text-center text-[25px] font-bold mt-3">AI summary</DrawerTitle>
        <DrawerDescription className="text-center text-sm text-muted-foreground">Summary from {who} · this week</DrawerDescription>
        <p className="mt-4 text-[14.5px] leading-relaxed">{summary}</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="card-bz !mx-0 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-primary"><Bed size={17} weight="light" /> Sleep quality</div>
            <div className="text-[13px] mt-1.5">{sleep}</div>
          </div>
          <div className="card-bz !mx-0 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-destructive"><Heart size={17} weight="light" /> Vital signs</div>
            <div className="text-[13px] mt-1.5">{vitalsNote}</div>
          </div>
        </div>
        {week && week.length > 0 && (
          <div className="mt-5">
            <div className="flex gap-1.5 h-28 items-end border-l border-border pl-1.5">
              {week.map((w, i) => (
                <span key={w.d} className={cn("flex-1 rounded-t-[9px] rounded-b-[4px]", i === week.length - 1 ? "bg-primary/25" : "bg-gradient-to-b from-[oklch(0.72_0.14_160)] to-primary")} style={{ height: `${Math.max(6, (w.v / max) * 100)}%` }} />
              ))}
            </div>
            <div className="flex gap-1.5 text-[10.5px] text-muted-foreground mt-1.5 pl-1.5">{week.map((w) => <span key={w.d} className="flex-1 text-center">{w.d}</span>)}</div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/* ---------- tiles + rows ---------- */

export type Tile = { to: string; label: string; icon: PhIcon };

export function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid grid-cols-3 gap-3 mx-[7px]">
      {tiles.map(({ to, label, icon: Icon }) => (
        <Link key={label} to={to} className="rounded-[22px] bg-card py-3.5 flex flex-col items-center gap-2 min-h-[96px] shadow-[0_1px_2px_oklch(0.3_0.05_165/0.05),0_10px_24px_-14px_oklch(0.3_0.06_165/0.2)] border border-[oklch(0.3_0.05_165/0.05)] active:scale-[0.98] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <span className="w-11 h-11 rounded-full grid place-items-center bg-primary/12 text-primary"><Icon size={23} weight="light" /></span>
          <span className="text-[12.5px] font-semibold">{label}</span>
        </Link>
      ))}
    </div>
  );
}

/** List card: bold title + meta on top, avatar + detail row below. */
export function RowCard({ title, meta, lead, primary, secondary, to, onClick }: {
  title: string; meta?: string; lead: ReactNode; primary: string; secondary?: string; to?: string; onClick?: () => void;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <div className="text-[17px] font-semibold">{title}</div>
        {meta && <div className="text-[12px] text-muted-foreground">{meta}</div>}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className="w-11 h-11 rounded-full bg-muted/60 grid place-items-center shrink-0 overflow-hidden">{lead}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-medium truncate">{primary}</div>
          {secondary && <div className="text-[13px] text-muted-foreground truncate">{secondary}</div>}
        </div>
        {(to || onClick) && <CaretRight size={20} weight="light" className="text-muted-foreground shrink-0" />}
      </div>
    </>
  );
  const cls = "card-bz rounded-3xl p-4 block w-[calc(100%-14px)] text-left";
  if (to) return <Link to={to} className={cls}>{body}</Link>;
  if (onClick) return <button onClick={onClick} className={cls}>{body}</button>;
  return <div className={cls}>{body}</div>;
}
