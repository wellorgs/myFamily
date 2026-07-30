import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import {
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Video, Phone, Trash2,
} from "lucide-react";
import { useState } from "react";
import { useCallLog, formatDuration, formatWhen, clearCallLog, type CallEntry } from "@/lib/call-log";
import { CallDialog, type CallContact } from "@/components/mobile/CallDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/calls")({
  head: () => ({ meta: [
    { title: "Call log — myFamily" },
    { name: "description", content: "Recent calls with family and caregivers." },
  ] }),
  component: Calls,
});

function Calls() {
  const entries = useCallLog();
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<CallContact | null>(null);
  const [dir, setDir] = useState<"incoming" | "outgoing">("outgoing");
  const [mode, setMode] = useState<"audio" | "video">("audio");

  const callBack = (e: CallEntry, m: "audio" | "video" = e.mode) => {
    setContact({ name: e.name, emoji: e.emoji, relation: e.relation });
    setDir("outgoing");
    setMode(m);
    setOpen(true);
  };

  const simulateIncoming = () => {
    setContact({ name: "Priya", emoji: "👩🏽", relation: "Daughter" });
    setDir("incoming");
    setMode("audio");
    setOpen(true);
  };

  return (
    <PhoneFrame>
      <Screen
        title="Calls"
        subtitle={entries.length ? `${entries.length} recent` : "No recent calls"}
        back={true}
        right={
          entries.length > 0 ? (
            <button
              onClick={() => { clearCallLog(); toast("Call log cleared"); }}
              aria-label="Clear call log"
              className="w-11 h-11 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : undefined
        }
      >
        <Button
          onClick={simulateIncoming}
          variant="secondary"
          className="w-full h-11 rounded-2xl mb-4"
        >
          <PhoneIncoming className="w-4 h-4 mr-2" /> Simulate incoming call
        </Button>

        {entries.length === 0 ? (
          <SoftCard className="p-8 text-center">
            <Phone className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <div className="font-medium">No calls yet</div>
            <div className="text-sm text-muted-foreground mt-1">
              Calls placed from the dashboard will show up here.
            </div>
          </SoftCard>
        ) : (
          <SoftCard className="p-2">
            <ul className="divide-y">
              {entries.map((e) => (
                <li key={e.id}>
                  <div className="flex items-center gap-3 px-3 py-3">
                    <div className="w-11 h-11 rounded-2xl bg-muted grid place-items-center text-xl shrink-0">
                      {e.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[15px] truncate">{e.name}</span>
                        {e.mode === "video" && <Video className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <DirIcon entry={e} />
                        <span className="truncate">
                          {labelFor(e)} · {formatWhen(e.at)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => callBack(e, "audio")}
                      aria-label={`Call ${e.name}`}
                      className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center hover:bg-primary/20"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => callBack(e, "video")}
                      aria-label={`Video call ${e.name}`}
                      className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center hover:bg-primary/20"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </SoftCard>
        )}

        <CallDialog
          open={open}
          onOpenChange={setOpen}
          contact={contact}
          direction={dir}
          mode={mode}
        />
      </Screen>
    </PhoneFrame>
  );
}

function DirIcon({ entry }: { entry: CallEntry }) {
  if (entry.status === "missed") return <PhoneMissed className="w-3.5 h-3.5 text-destructive" />;
  if (entry.direction === "incoming") return <PhoneIncoming className="w-3.5 h-3.5 text-success" />;
  return <PhoneOutgoing className="w-3.5 h-3.5 text-primary" />;
}

function labelFor(e: CallEntry): string {
  if (e.status === "missed") return "Missed";
  if (e.status === "declined") return "Declined";
  if (e.status === "canceled") return "Canceled";
  return formatDuration(e.duration);
}
