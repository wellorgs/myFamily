import { createFileRoute, notFound } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { parents } from "@/lib/mock-data";
import { useTimeline } from "@/lib/queries/use-timeline";
import { useMedicines } from "@/lib/queries/use-medicines";
import { useAppointments } from "@/lib/queries/use-appointments";
import { useAppState } from "@/lib/app-state";
import { firebaseAuth } from "@/integrations/firebase/client";
import { isMockAccount } from "@/lib/account-utils";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/integrations/firebase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageSquare, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ActionDialog, type ActionKind } from "@/components/mobile/ActionDialog";

export const Route = createFileRoute("/family/parents/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id === "mom" ? "Mom" : "Dad"} — myFamily` }] }),
  loader: async ({ params }) => {
    const user = firebaseAuth.currentUser;
    if (!user) throw notFound();

    if (isMockAccount(user.email)) {
      const p = parents.find((x) => x.id === params.id);
      if (!p) throw notFound();
      return { parent: p };
    }

    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "parents", params.id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) throw notFound();
    return { parent: { id: snapshot.id, ...snapshot.data() } };
  },
  component: Details,
});

function Details() {
  const { parent: p } = Route.useLoaderData();
  const { data: timeline } = useTimeline(p.id);
  const { data: medicines } = useMedicines(p.id);
  const { data: appointments } = useAppointments(p.id);
  const [dialogKind, setDialogKind] = useState<ActionKind | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = (k: ActionKind) => { setDialogKind(k); setDialogOpen(true); };
  const emoji = p.id === "mom" ? "👩🏽‍🦳" : "👴🏽";

  return (
    <Screen title={p.name} back={true}>
      <SoftCard className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-muted grid place-items-center text-3xl">{emoji}</div>
          <div className="flex-1">
            <div className="font-semibold text-lg">{p.name}</div>
            <div className="text-sm text-muted-foreground">Last seen {p.lastSeen}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Button variant="secondary" className="rounded-2xl h-11" onClick={() => openDialog("call")}><Phone className="w-4 h-4 mr-2" /> Call</Button>
          <Button variant="secondary" className="rounded-2xl h-11" onClick={() => openDialog("video")}><Video className="w-4 h-4 mr-2" /> Video</Button>
          <Button variant="secondary" className="rounded-2xl h-11" onClick={() => openDialog("text")}><MessageSquare className="w-4 h-4 mr-2" /> Text</Button>
        </div>
      </SoftCard>

      <Tabs defaultValue="timeline">
        <TabsList className="w-full grid grid-cols-4 rounded-full h-11 bg-muted p-1">
          <TabsTrigger value="timeline" className="rounded-full text-xs">Timeline</TabsTrigger>
          <TabsTrigger value="meds" className="rounded-full text-xs">Meds</TabsTrigger>
          <TabsTrigger value="appts" className="rounded-full text-xs">Visits</TabsTrigger>
          <TabsTrigger value="summary" className="rounded-full text-xs">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          {!timeline ? null : (
          <SoftCard className="p-2">
            <ul>
              {timeline.map((e, i) => (
                <li key={i} className="flex gap-3 items-start px-3 py-3">
                  <div className="text-xs font-semibold text-muted-foreground w-16 pt-0.5">{e.time}</div>
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1 text-sm">{e.label}</div>
                </li>
              ))}
            </ul>
          </SoftCard>
          )}
        </TabsContent>

        <TabsContent value="meds" className="mt-4 space-y-3">
          {!medicines ? null : (
          <>
          {medicines.map((m) => (
            <SoftCard key={m.id}>
              <div className="font-semibold">{m.name} · {m.dose}</div>
              <div className="text-sm text-muted-foreground">{m.freq} · {m.food}</div>
              <div className="text-xs mt-1 text-muted-foreground">Stock: {m.stock} · {m.verified ? "Verified" : "Pending approval"}</div>
            </SoftCard>
          ))}
          </>
          )}
        </TabsContent>

        <TabsContent value="appts" className="mt-4 space-y-3">
          {!appointments ? null : (
          <>
          {appointments.map((a) => (
            <SoftCard key={a.id}>
              <div className="font-semibold">{a.doctor} · {a.specialty}</div>
              <div className="text-sm text-muted-foreground">{a.date} at {a.time} · {a.hospital}</div>
            </SoftCard>
          ))}
          </>
          )}
        </TabsContent>

        <TabsContent value="summary" className="mt-4 space-y-3">
          <SoftCard tone="green">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Today</div>
            <p className="mt-1 text-sm">Wellness {p.wellness}. All morning medicines taken. {p.steps.toLocaleString()} steps. Sleep {p.sleep}. Mood: {p.mood}.</p>
          </SoftCard>
          <SoftCard>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">This week</div>
            <p className="mt-1 text-sm">Adherence 92%. Walking down 8%. Two missed evening medicines. One doctor visit.</p>
          </SoftCard>
        </TabsContent>
      </Tabs>

      {dialogKind && (
        <ActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          kind={dialogKind}
          contactName={p.name}
          emoji={emoji}
        />
      )}
    </Screen>
  );
}
