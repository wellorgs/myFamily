import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { deleteDoc, doc, getFirestore } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowUpRight, Copy, LinkSimple, PaperPlaneTilt, Trash } from "@phosphor-icons/react";
import { Screen } from "@/components/mobile/Screen";
import { FamilyTopBar } from "@/components/mobile/ParentSwitcher";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { firebaseApp, firebaseAuth } from "@/integrations/firebase/client";
import { useAppState } from "@/lib/app-state";
import { getCurrentUserFamily } from "@/lib/family-operations";
import { Avatar } from "@/components/mobile/KinBlocks";
import { useFamilyMembers } from "@/lib/queries/use-family-members";
import { useParents } from "@/lib/queries/use-parents";
import { useDashboardGuard } from "@/lib/route-guards";

export const Route = createFileRoute("/family/circle")({
  head: () => ({ meta: [{ title: "Care circle — myFamily" }] }),
  component: Circle,
});

type Member = { id: string; name?: string; relation?: string; role?: string };

function Circle() {
  const { familyId } = useAppState();
  const canAccess = useDashboardGuard();
  const qc = useQueryClient();
  const { data: members } = useFamilyMembers(familyId);
  const { data: parents } = useParents(familyId);
  const [code, setCode] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Member | null>(null);
  const me = firebaseAuth.currentUser?.uid;

  useEffect(() => {
    getCurrentUserFamily()
      .then((f) => { setCode(f?.invite_code ?? null); setOwner(f?.created_by ?? null); })
      .catch(() => {});
  }, [familyId]);

  if (!canAccess) return null;
  const list = (members ?? []) as Member[];
  const iOwn = !!me && owner === me;

  const copy = async () => {
    if (!code) return;
    try { await navigator.clipboard.writeText(code); toast.success("Code copied"); } catch { toast.error("Couldn't copy the code"); }
  };
  const sms = () => {
    if (!code) return;
    window.location.href = `sms:?body=${encodeURIComponent(`Join our family on myFamily. Use this code: ${code}`)}`;
  };
  const remove = async () => {
    if (!removing) return;
    try {
      await deleteDoc(doc(getFirestore(firebaseApp), "families", familyId, "family_members", removing.id));
      await qc.invalidateQueries({ queryKey: ["familyMembers", familyId] });
      toast.success(`${removing.name ?? "Member"} removed from your circle`);
    } catch {
      toast.error("Couldn't remove them. Try again.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Screen topbar={<FamilyTopBar everyone />} title="Care circle" subtitle={`${list.length} ${list.length === 1 ? "person" : "people"} · ${parents?.length ?? 0} ${parents?.length === 1 ? "parent" : "parents"}`}>
      <div className="space-y-4">
        <section className="card-bz rounded-3xl p-4" aria-label="Family members">
          <ul className="divide-y divide-border">
            {list.map((m) => {
              const mine = m.id === me;
              const isOwner = m.id === owner;
              return (
                <li key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar name={m.name ?? "?"} className="w-10 h-10 text-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[15.5px] font-semibold truncate">{m.name ?? "Family member"}{mine ? " (you)" : ""}</div>
                    <div className="text-[12.5px] text-muted-foreground">{isOwner ? "Owner" : m.relation ?? (m.role === "parent" ? "Parent" : "Family member")}</div>
                  </div>
                  {iOwn && !mine && (
                    <button onClick={() => setRemoving(m)} aria-label={`Remove ${m.name ?? "member"}`}
                      className="w-10 h-10 rounded-full grid place-items-center text-destructive bg-destructive/10 active:scale-95 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <Trash size={19} weight="light" />
                    </button>
                  )}
                </li>
              );
            })}
            {list.length === 0 && <li className="text-sm text-muted-foreground">Nobody here yet.</li>}
          </ul>
        </section>

        <section className="card-bz rounded-3xl p-4 bg-gradient-to-b from-card to-[oklch(0.96_0.03_160)]" aria-label="Invite someone">
          <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">Invite someone</div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3.5 py-3 mt-3">
            <LinkSimple size={20} weight="light" className="text-muted-foreground" />
            <span className="font-display font-bold tracking-[0.14em] text-[15px]">{code ?? "…"}</span>
            <button onClick={copy} className="ml-auto flex items-center gap-1 text-[12px] font-semibold rounded-full bg-primary/12 text-primary px-3 py-1.5"><Copy size={15} weight="light" />Copy</button>
          </div>
          <button onClick={sms} disabled={!code}
            className="mt-3 w-full h-[54px] rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-between pl-6 pr-1.5 shadow-[0_10px_22px_-10px_oklch(0.58_0.13_163/0.7)] active:scale-[0.98] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-60">
            Invite by SMS
            <span className="w-[42px] h-[42px] rounded-full bg-white/20 grid place-items-center"><PaperPlaneTilt size={20} weight="light" /></span>
          </button>
          <p className="text-[12px] text-muted-foreground mt-3 flex items-center gap-1.5"><ArrowUpRight size={14} weight="light" />They enter this code after signing up.</p>
        </section>
      </div>

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name ?? "this person"}?</AlertDialogTitle>
            <AlertDialogDescription>They will stop getting alerts and can't see your parents' health data. You can invite them again with the code.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Screen>
  );
}
