import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, MoonStars, Sun, SunHorizon, X, type Icon } from "@phosphor-icons/react";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import {
  ALL_DAYS, defaultSlots, periodOf, updateMedicineSchedule, type MedicineSlot,
} from "@/lib/medicine-operations";

export type EditableMedicine = {
  id: string; name: string; dose?: string; salt?: string; slots?: MedicineSlot[]; days?: number[]; refillAtDays?: number;
};

const FOODS: { v: MedicineSlot["food"]; label: string }[] = [
  { v: "before", label: "Before" }, { v: "with", label: "With" }, { v: "after", label: "After" }, { v: "any", label: "Any time" },
];
const DAY = ["S", "M", "T", "W", "T", "F", "S"];
const COUNTS = [1, 2, 3, 4];
const countLabel = (n: number) => (n === 1 ? "Once" : n === 2 ? "Twice" : `${n} times`);

export const periodIcon = (time: string): Icon => {
  const p = periodOf(time);
  return p === "Morning" ? SunHorizon : p === "Afternoon" ? Sun : MoonStars;
};


/** How often, what times (with food rule) and which days. Shared by the editor and the scan flow. */
export function ScheduleFields({ slots, days, onSlots, onDays }: {
  slots: MedicineSlot[]; days: number[]; onSlots: (s: MedicineSlot[]) => void; onDays: (d: number[]) => void;
}) {
  const setCount = (n: number) => onSlots(defaultSlots(n).map((s, i) => slots[i] ?? s)); // keep times already chosen
  const patch = (i: number, p: Partial<MedicineSlot>) => onSlots(slots.map((s, n) => (n === i ? { ...s, ...p } : s)));
  const toggleDay = (d: number) => onDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort());
  return (
    <>
        <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mt-5 mb-1.5">How often</div>
        <div className="flex bg-muted rounded-full p-[3px] gap-0.5" role="tablist">
          {COUNTS.map((n) => (
            <button key={n} role="tab" aria-selected={slots.length === n} onClick={() => setCount(n)}
              className={cn("flex-1 py-2 rounded-full text-[13px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]", slots.length === n ? "bg-card text-foreground shadow-[0_2px_8px_-2px_oklch(0.3_0.06_165/0.25)]" : "text-muted-foreground")}>
              {countLabel(n)}
            </button>
          ))}
        </div>

        <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mt-5 mb-1.5">Times</div>
        <div className="space-y-2">
          {slots.map((s, i) => {
            const PIcon = periodIcon(s.time);
            return (
              <div key={i} className="rounded-[18px] bg-muted/70 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <PIcon size={22} weight="light" className="text-primary shrink-0" />
                  <input type="time" value={s.time} onChange={(e) => e.target.value && patch(i, { time: e.target.value })}
                    aria-label={`Dose ${i + 1} time`} className="bg-transparent font-display font-bold text-[16px] outline-none w-[132px]" />
                  <span className="text-[12.5px] text-muted-foreground">{periodOf(s.time)}</span>
                </div>
                <div className="flex gap-1.5 mt-2.5" role="radiogroup" aria-label="Food rule">
                  {FOODS.map((f) => (
                    <button key={f.v} role="radio" aria-checked={s.food === f.v} onClick={() => patch(i, { food: f.v })}
                      className={cn("flex-1 py-1.5 rounded-full text-[12px] font-semibold", s.food === f.v ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mt-5 mb-1.5">Days</div>
        <div className="flex gap-1.5">
          {DAY.map((d, i) => (
            <button key={i} onClick={() => toggleDay(i)} aria-pressed={days.includes(i)} aria-label={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i]}
              className={cn("flex-1 h-[34px] rounded-full text-[12px] font-semibold", days.includes(i) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {d}
            </button>
          ))}
        </div>

    </>
  );
}

/** Bottom sheet to set how often, when, and on which days a medicine is taken. */
export function MedicineEditor({ med, onClose, onSaved }: { med: EditableMedicine | null; onClose: () => void; onSaved: () => void }) {
  const [slots, setSlots] = useState<MedicineSlot[]>(defaultSlots(1));
  const [days, setDays] = useState<number[]>(ALL_DAYS);
  const [refill, setRefill] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!med) return;
    setSlots(med.slots?.length ? med.slots : defaultSlots(1));
    setDays(med.days?.length ? med.days : ALL_DAYS);
    setRefill((med.refillAtDays ?? 7) > 0);
  }, [med]);


  const save = async () => {
    if (!med) return;
    if (days.length === 0) { toast.error("Pick at least one day"); return; }
    if (new Set(slots.map((s) => s.time)).size !== slots.length) { toast.error("Two doses can't share a time"); return; }
    setBusy(true);
    try {
      await updateMedicineSchedule(med.id, { slots, days, refillAtDays: refill ? 7 : 0 });
      toast.success(`${med.name} schedule saved`);
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={!!med} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-w-[430px] mx-auto rounded-t-[34px] bg-background px-6 pb-7 pt-4 max-h-[92dvh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <DrawerTitle className="text-[22px] font-bold">{med?.name}</DrawerTitle>
            <DrawerDescription className="text-[13px] text-muted-foreground">{[med?.salt, med?.dose].filter(Boolean).join(" · ") || "Set when it's taken"}</DrawerDescription>
          </div>
          <button onClick={onClose} aria-label="Close" className="glass w-10 h-10 rounded-full grid place-items-center"><X size={19} weight="light" /></button>
        </div>

        <ScheduleFields slots={slots} days={days} onSlots={setSlots} onDays={setDays} />

        <button onClick={() => setRefill(!refill)} role="switch" aria-checked={refill} className="w-full flex items-center justify-between mt-5 text-left">
          <span>
            <span className="block text-[15px] font-semibold">Refill alert</span>
            <span className="block text-[12.5px] text-muted-foreground">Warn the family when 7 days are left</span>
          </span>
          <span className={cn("w-[46px] h-[28px] rounded-full relative transition-colors duration-500", refill ? "bg-primary" : "bg-muted-foreground/30")}>
            <span className={cn("absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]", refill ? "left-[21px]" : "left-[3px]")} />
          </span>
        </button>

        <button onClick={save} disabled={busy}
          className="mt-6 w-full h-[54px] rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-between pl-6 pr-1.5 shadow-[0_10px_22px_-10px_oklch(0.58_0.13_163/0.7)] active:scale-[0.98] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-60">
          {busy ? "Saving…" : "Save changes"}
          <span className="w-[42px] h-[42px] rounded-full bg-white/20 grid place-items-center"><Check size={20} weight="light" /></span>
        </button>
      </DrawerContent>
    </Drawer>
  );
}
