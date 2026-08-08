import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";
import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { useParents } from "@/lib/queries/use-parents";
import { isMockAccount } from "@/lib/account-utils";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { firebaseApp } from "@/integrations/firebase/client";

export const Route = createFileRoute("/family/appointments/new")({
  head: () => ({ meta: [{ title: "New appointment — myFamily" }] }),
  component: NewAppt,
});

function NewAppt() {
  const nav = useNavigate();
  const { familyId, email } = useAppState();
  const { data: parents } = useParents(familyId);
  const [parentId, setParentId] = useState("");
  const [doctor, setDoctor] = useState("");
  const [hospital, setHospital] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const effectiveParentId = parentId || parents?.[0]?.id || "";

  const handleSave = async () => {
    if (!doctor.trim() || !date || !time) {
      toast.error("Please enter doctor, date and time.");
      return;
    }
    setSaving(true);
    try {
      if (!isMockAccount(email)) {
        const db = getFirestore(firebaseApp);
        await addDoc(collection(db, "appointments"), {
          parentId: effectiveParentId,
          familyId,
          doctor: doctor.trim(),
          hospital: hospital.trim(),
          date,
          time,
          notes: notes.trim(),
          createdAt: serverTimestamp(),
        });
      }
      toast.success("Appointment saved. Parent notified.");
      nav({ to: "/family/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="New appointment" back={true}>
      <SoftCard className="space-y-4">
        {parents && parents.length > 0 && (
          <div>
            <Label>For</Label>
            <select
              value={effectiveParentId}
              onChange={(e) => setParentId(e.target.value)}
              className="h-12 w-full rounded-2xl mt-1 border border-input bg-background px-3 text-sm"
            >
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
        <div><Label>Doctor</Label><Input value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Dr. Sharma" className="h-12 rounded-2xl mt-1" /></div>
        <div><Label>Hospital</Label><Input value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="Apollo Clinic" className="h-12 rounded-2xl mt-1" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Date</Label><Input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="h-12 rounded-2xl mt-1" /></div>
          <div><Label>Time</Label><Input value={time} onChange={(e) => setTime(e.target.value)} type="time" className="h-12 rounded-2xl mt-1" /></div>
        </div>
        <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fasting required" className="rounded-2xl mt-1" /></div>
        <Button variant="secondary" className="rounded-2xl h-11 w-full"><Paperclip className="w-4 h-4 mr-2" /> Attach reports</Button>
      </SoftCard>
      <Button className="w-full h-14 rounded-2xl text-base mt-4" disabled={saving} onClick={handleSave}>
        {saving ? "Saving…" : "Save appointment"}
      </Button>
    </Screen>
  );
}
