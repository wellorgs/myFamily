import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Check, Image as ImageIcon, Keyboard, Warning, X } from "@phosphor-icons/react";
import { ScheduleFields } from "@/components/mobile/MedicineEditor";
import { useAppState } from "@/lib/app-state";
import { isMockAccount } from "@/lib/account-utils";
import { firebaseAuth } from "@/integrations/firebase/client";
import { checkInteractions, lookupMedicine, scanMedicineLabel } from "@/lib/ai";
import { useParents } from "@/lib/queries/use-parents";
import { useFamilyMedicines } from "@/lib/queries/use-family-medicines";
import { useSelectedParent } from "@/lib/selected-parent";
import { useSetupStore } from "@/lib/setup-store";
import { ALL_DAYS, defaultSlots, saveScannedMedicine, type MedicineSlot } from "@/lib/medicine-operations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/parent/medicine/scan")({
  head: () => ({ meta: [{ title: "Scan medicine — myFamily" }] }),
  component: Scan,
});

type Phase = "capture" | "reading" | "review";
const token = async () => (await firebaseAuth.currentUser?.getIdToken()) ?? "";

/** Shrinks a photo so the upload stays small on mobile data. */
async function toJpegBase64(src: ImageBitmap | HTMLVideoElement, w: number, h: number): Promise<{ b64: string; url: string }> {
  const scale = Math.min(1, 1280 / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * scale); c.height = Math.round(h * scale);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  const url = c.toDataURL("image/jpeg", 0.82);
  return { b64: url.split(",")[1], url };
}

export function Scan() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { parentId, familyId, email, role } = useAppState();
  const byFamily = role !== "parent";
  const { data: parentList } = useParents(familyId);
  const { selected } = useSelectedParent(parentList as { id: string; name: string }[] | undefined);
  const { data: existing } = useFamilyMedicines(familyId);
  const setup = useSetupStore(parentId);
  const forWhom = byFamily ? selected?.name.split(" ")[0] : undefined;

  const [phase, setPhase] = useState<Phase>("capture");
  const [camErr, setCamErr] = useState("");
  const [shot, setShot] = useState("");
  const [name, setName] = useState("");
  const [salt, setSalt] = useState("");
  const [dose, setDose] = useState("");
  const [uses, setUses] = useState("");
  const [slots, setSlots] = useState<MedicineSlot[]>(defaultSlots(1));
  const [days, setDays] = useState<number[]>(ALL_DAYS);
  const [remind, setRemind] = useState(true);
  const [clash, setClash] = useState("");
  const [saving, setSaving] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const stream = useRef<MediaStream | null>(null);

  const stop = () => stream.current?.getTracks().forEach((t) => t.stop());

  useEffect(() => {
    if (phase !== "capture") return;
    let live = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 } }, audio: false })
      .then((s) => {
        if (!live) { s.getTracks().forEach((t) => t.stop()); return; }
        stream.current = s;
        if (video.current) video.current.srcObject = s;
        setCamErr("");
      })
      .catch(() => live && setCamErr("Camera is off. Allow it in your browser settings, or pick a photo instead."));
    return () => { live = false; stop(); };
  }, [phase]);

  const fill = (r: { name?: string; salt?: string; dosage?: string; uses?: string }) => {
    setName(r.name ?? ""); setSalt(r.salt ?? ""); setDose(r.dosage ?? ""); setUses(r.uses ?? "");
  };

  const checkClash = async (n: string) => {
    setClash("");
    try {
      const target = byFamily ? selected?.id : parentId;
      const current = ((existing ?? []) as { name: string; parentId?: string; verified?: boolean }[])
        .filter((m) => m.verified && (!m.parentId || m.parentId === target)).map((m) => m.name);
      const r = await checkInteractions({ data: { idToken: await token(), newMedicine: n, current } });
      if (r.warn) setClash(r.note);
    } catch { /* AI unavailable: skip */ }
  };

  const read = async (b64: string, url: string) => {
    setShot(url); setPhase("reading"); stop();
    try {
      const r = await scanMedicineLabel({ data: { image: b64, idToken: await token() } });
      fill(r); setPhase("review"); void checkClash(r.name);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that label.");
      setShot(""); setPhase("capture");
    }
  };

  const snap = async () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const { b64, url } = await toJpegBase64(v, v.videoWidth, v.videoHeight);
    void read(b64, url);
  };

  const fromFile = async (f?: File) => {
    if (!f) return;
    const bmp = await createImageBitmap(f);
    const { b64, url } = await toJpegBase64(bmp, bmp.width, bmp.height);
    void read(b64, url);
  };

  const typeInstead = () => { stop(); setShot(""); fill({}); setPhase("review"); };

  // Known medicine by name: fill the salt and use if they are empty.
  const lookup = async () => {
    const n = name.trim();
    if (n.length < 3 || salt) return;
    try {
      const r = await lookupMedicine({ data: { idToken: await token(), name: n } });
      if (r.salt) setSalt(r.salt);
      if (r.uses && !uses) setUses(r.uses);
      void checkClash(n);
    } catch { /* optional */ }
  };

  const save = async () => {
    if (!name.trim()) { toast.error("Enter the medicine name"); return; }
    if (days.length === 0) { toast.error("Pick at least one day"); return; }
    if (new Set(slots.map((s) => s.time)).size !== slots.length) { toast.error("Two doses can't share a time"); return; }
    setSaving(true);
    try {
      if (!isMockAccount(email)) {
        await saveScannedMedicine({
          name: name.trim(), salt, uses, dosage: dose,
          schedule: { slots, days, refillAtDays: remind ? 7 : 0 },
          familyId,
          parentId: byFamily ? selected?.id : undefined,
          parentName: forWhom,
          autoApprove: byFamily,
        });
        await qc.invalidateQueries({ queryKey: ["familyMedicines", familyId] });
      }
      setup.markStepDone("medicine");
      toast.success(byFamily ? `${name.trim()} added` : "Sent to your family to approve");
      navigate({ to: byFamily ? "/family/medicines" : "/parent/home" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const close = () => navigate({ to: byFamily ? "/family/medicines" : "/parent/home" });

  /* ------------ capture / reading: full-bleed camera ------------ */
  if (phase !== "review") {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="relative flex-1 min-h-0 bg-black overflow-hidden text-white">
          {phase === "reading" && shot
            ? <img src={shot} alt="" className="absolute inset-0 w-full h-full object-cover" />
            : <video ref={video} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70" />

          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 pt-5">
            <button onClick={close} aria-label="Close" className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-xl grid place-items-center"><X size={20} /></button>
            <div className="px-4 h-9 rounded-full bg-white/15 backdrop-blur-xl grid place-items-center text-[13px] font-semibold">
              {forWhom ? `For ${forWhom}` : "Scan medicine"}
            </div>
            <span className="w-11" />
          </div>

          {/* label frame */}
          <div className="absolute inset-x-8 top-[22%] h-[40%] pointer-events-none">
            {["top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-3xl", "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-3xl",
              "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-3xl", "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-3xl"].map((c) => (
              <span key={c} className={cn("absolute w-10 h-10 border-white", c)} />
            ))}
            {phase === "reading" && <span className="absolute inset-x-2 h-[2px] bg-primary shadow-[0_0_14px_var(--color-primary)] animate-[scan_1.6s_ease-in-out_infinite]" />}
          </div>

          <div className="absolute inset-x-0 top-[66%] text-center px-8">
            <div className="text-[17px] font-semibold">{phase === "reading" ? "Reading the label" : "Fit the label in the frame"}</div>
            <div className="text-[13px] text-white/70 mt-1">{phase === "reading" ? "Finding the name, salt and strength" : "Strip, bottle or box. Hold steady."}</div>
          </div>

          {camErr && phase === "capture" && (
            <div className="absolute inset-x-5 top-[18%] rounded-2xl bg-black/60 backdrop-blur-xl p-4 text-[13.5px]">{camErr}</div>
          )}

          {phase === "capture" && (
            <div className="absolute bottom-0 inset-x-0 pb-8 px-8 flex items-center justify-between">
              <button onClick={() => picker.current?.click()} aria-label="Choose a photo" className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xl grid place-items-center"><ImageIcon size={24} /></button>
              <button onClick={snap} disabled={!!camErr} aria-label="Take photo" className="w-[76px] h-[76px] rounded-full border-4 border-white grid place-items-center active:scale-95 transition-transform disabled:opacity-40">
                <span className="w-[58px] h-[58px] rounded-full bg-white" />
              </button>
              <button onClick={typeInstead} aria-label="Type it instead" className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xl grid place-items-center"><Keyboard size={24} /></button>
            </div>
          )}
          <input ref={picker} type="file" accept="image/*" capture="environment" hidden onChange={(e) => fromFile(e.target.files?.[0])} />
        </div>
      </div>
    );
  }

  /* ------------ review: edit, set times, add ------------ */
  const label = "text-[10.5px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mt-6 mb-1.5";
  const field = "w-full h-12 rounded-2xl bg-card border border-border px-4 text-[15px] outline-none focus:border-primary";
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pt-4 pb-8">
        <div className="flex items-center justify-between">
          <button onClick={() => { setPhase("capture"); }} aria-label="Back to camera" className="card-bz w-11 h-11 rounded-full grid place-items-center"><ArrowLeft size={20} /></button>
          <div className="text-[15px] font-semibold">{forWhom ? `For ${forWhom}` : "New medicine"}</div>
          <span className="w-11" />
        </div>

        {shot && <img src={shot} alt="Scanned label" className="mt-4 h-28 w-full rounded-2xl object-cover" />}

        <div className={label}>Medicine</div>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} onBlur={lookup} placeholder="Name, e.g. Dolo 650" aria-label="Medicine name" />
        <input className={cn(field, "mt-2")} value={salt} onChange={(e) => setSalt(e.target.value)} placeholder="Salt, e.g. Paracetamol" aria-label="Salt" />
        <div className="flex gap-2 mt-2">
          <input className={field} value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Strength" aria-label="Strength" />
          <input className={field} value={uses} onChange={(e) => setUses(e.target.value)} placeholder="Used for" aria-label="Used for" />
        </div>

        {clash && (
          <div role="alert" className="mt-3 rounded-2xl bg-warning/25 p-3 text-[13.5px] font-medium flex gap-2">
            <Warning size={18} weight="fill" className="shrink-0 mt-0.5" />
            <span>Check with the doctor: {clash}</span>
          </div>
        )}

        <ScheduleFields slots={slots} days={days} onSlots={setSlots} onDays={setDays} />

        <button onClick={() => setRemind(!remind)} role="switch" aria-checked={remind} className="w-full flex items-center justify-between mt-6 text-left">
          <span>
            <span className="block text-[15px] font-semibold">Reminders</span>
            <span className="block text-[12.5px] text-muted-foreground">{forWhom ? `Remind ${forWhom} at each time and when stock runs low` : "Remind at each time and when stock runs low"}</span>
          </span>
          <span className={cn("w-[46px] h-[28px] rounded-full relative transition-colors duration-300", remind ? "bg-primary" : "bg-muted-foreground/30")}>
            <span className={cn("absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-all duration-300", remind ? "left-[21px]" : "left-[3px]")} />
          </span>
        </button>

        <button onClick={save} disabled={saving}
          className="mt-7 w-full h-[54px] rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-between pl-6 pr-1.5 shadow-[0_10px_22px_-10px_oklch(0.58_0.13_163/0.7)] active:scale-[0.98] transition-transform disabled:opacity-60">
          {saving ? "Saving…" : byFamily ? "Add medicine" : "Send for approval"}
          <span className="w-[42px] h-[42px] rounded-full bg-white/20 grid place-items-center"><Check size={20} /></span>
        </button>
      </div>
    </div>
  );
}
