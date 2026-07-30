import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";

export const Route = createFileRoute("/family/appointments/new")({
  head: () => ({ meta: [{ title: "New appointment — myFamily" }] }),
  component: NewAppt,
});

function NewAppt() {
  const nav = useNavigate();
  return (
    <Screen title="New appointment" back={true}>
      <SoftCard className="space-y-4">
        <div><Label>Doctor</Label><Input placeholder="Dr. Sharma" className="h-12 rounded-2xl mt-1" /></div>
        <div><Label>Hospital</Label><Input placeholder="Apollo Clinic" className="h-12 rounded-2xl mt-1" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Date</Label><Input type="date" className="h-12 rounded-2xl mt-1" /></div>
          <div><Label>Time</Label><Input type="time" className="h-12 rounded-2xl mt-1" /></div>
        </div>
        <div><Label>Address</Label><Input placeholder="MG Road" className="h-12 rounded-2xl mt-1" /></div>
        <div><Label>Notes</Label><Textarea placeholder="Fasting required" className="rounded-2xl mt-1" /></div>
        <Button variant="secondary" className="rounded-2xl h-11 w-full"><Paperclip className="w-4 h-4 mr-2" /> Attach reports</Button>
      </SoftCard>
      <Button className="w-full h-14 rounded-2xl text-base mt-4" onClick={() => { toast.success("Appointment saved. Parent notified."); nav({ to: "/family/dashboard" }); }}>
        Save appointment
      </Button>
    </Screen>
  );
}
