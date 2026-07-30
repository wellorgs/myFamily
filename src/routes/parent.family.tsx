import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { useAppState } from "@/lib/app-state";
import { useFamilyMembers } from "@/lib/queries/use-family-members";
import { Phone, Video, Mic, MessageSquare, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ActionDialog, type ActionKind } from "@/components/mobile/ActionDialog";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/parent/family")({
  head: () => ({ meta: [{ title: "Family — myFamily" }] }),
  component: Family,
});

function Family() {
  const { familyId } = useAppState();
  const { data: familyMembers } = useFamilyMembers(familyId);
  const t = useT();
  const [dialog, setDialog] = useState<{ kind: ActionKind; name: string; emoji: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = (d: { kind: ActionKind; name: string; emoji: string }) => {
    setDialog(d);
    setDialogOpen(true);
  };

  if (!familyMembers) return null;

  return (
    <Screen title={t("nav.family")} subtitle={t("l.reachFamily")}>
      <div className="space-y-4">
        {familyMembers.map((m) => (
          <SoftCard key={m.id} className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-muted grid place-items-center text-3xl flex-shrink-0">
                {m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base truncate">{m.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {m.relation}
                  {m.emergency && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-destructive" />
                        {t("l.emergency")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <ActionBtn
                icon={<Phone className="w-5 h-5" />}
                label="Call"
                onClick={() =>
                  openDialog({ kind: "call", name: m.name, emoji: m.emoji })
                }
              />
              <ActionBtn
                icon={<Video className="w-5 h-5" />}
                label="Video"
                onClick={() =>
                  openDialog({
                    kind: "video",
                    name: m.name,
                    emoji: m.emoji,
                  })
                }
              />
              <ActionBtn
                icon={<Mic className="w-5 h-5" />}
                label="Voice"
                onClick={() =>
                  openDialog({
                    kind: "voice",
                    name: m.name,
                    emoji: m.emoji,
                  })
                }
              />
              <ActionBtn
                icon={<MessageSquare className="w-5 h-5" />}
                label="Text"
                onClick={() =>
                  openDialog({
                    kind: "text",
                    name: m.name,
                    emoji: m.emoji,
                  })
                }
              />
            </div>
          </SoftCard>
        ))}

        <Button
          variant="secondary"
          className="w-full h-12 rounded-2xl"
          onClick={() => toast("Invite link copied")}
        >
          Invite family member
        </Button>
      </div>

      {dialog && (
        <ActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          kind={dialog.kind}
          contactName={dialog.name}
          emoji={dialog.emoji}
        />
      )}
    </Screen>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-card hover:bg-muted transition">
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
