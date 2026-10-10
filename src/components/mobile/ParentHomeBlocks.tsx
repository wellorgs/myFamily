import { useState } from "react";
import { doc, getFirestore, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import { firebaseApp } from "@/integrations/firebase/client";
import { isMockAccount } from "@/lib/account-utils";

const today = () => new Date().toISOString().slice(0, 10);

/** Daily "I'm fine" check-in. One tap; writes to the timeline + alerts so family sees it. */
export function CheckInCard({ parentId, familyId, email }: { parentId: string; familyId: string; email: string }) {
  const key = `myfamily.checkin.${parentId}.${today()}`;
  const [done, setDone] = useState(() => {
    try { return typeof window !== "undefined" && !!localStorage.getItem(key); } catch { return false; }
  });
  const [busy, setBusy] = useState(false);

  const checkIn = async () => {
    setBusy(true);
    try {
      if (!isMockAccount(email) && familyId) {
        const db = getFirestore(firebaseApp);
        const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        const id = `checkin_${parentId}_${today()}`;
        await setDoc(doc(db, "timeline", id), {
          parentId, familyId, time, label: "Checked in: I'm fine", tone: "green", timestamp: Timestamp.now(),
        });
        await setDoc(doc(db, "notifications", id), {
          familyId, parentId, tone: "green", title: "Checked in: I'm fine today", time: "just now", createdAt: serverTimestamp(),
        });
      }
      try { localStorage.setItem(key, "1"); } catch { /* storage unavailable */ }
      setDone(true);
      toast.success(familyId ? "Your family knows you're fine" : "Checked in");
    } catch {
      toast.error("Couldn't check in. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-[7px] rounded-[26px] bg-primary/10 p-4 flex items-center gap-3">
        <CheckCircle size={28} weight="light" className="text-primary shrink-0" />
        <div className="text-[15px] font-semibold">You checked in today. Have a lovely day.</div>
      </div>
    );
  }
  return (
    <button
      onClick={checkIn}
      disabled={busy}
      className="mx-[7px] w-[calc(100%-14px)] rounded-[26px] bg-primary text-primary-foreground pl-[18px] pr-2 py-3.5 flex items-center gap-3 text-left shadow-[0_10px_22px_-10px_oklch(0.58_0.13_163/0.7),inset_0_1px_0_oklch(1_0_0/0.3)] active:scale-[0.98] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-60"
    >
      <CheckCircle size={28} weight="light" className="shrink-0" />
      <span className="flex-1">
        <span className="block text-[17px] font-semibold">I'm fine today</span>
        <span className="block text-[12px] opacity-90">One tap lets your family know</span>
      </span>
      <span className="w-[42px] h-[42px] rounded-full bg-white/20 grid place-items-center shrink-0"><ArrowUpRight size={20} weight="light" /></span>
    </button>
  );
}
