import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { useTodayCards } from "@/lib/queries/use-today-cards";
import { useUpcomingEvents } from "@/lib/queries/use-upcoming-events";
import { Pill, Stethoscope, Footprints, Droplets, MessageCircleHeart, Bell, ShieldAlert, Copy, Check, MessageSquare, Share2 } from "lucide-react";
import { NotificationBell } from "@/components/mobile/NotificationBell";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { ActionDialog, type ActionKind } from "@/components/mobile/ActionDialog";
import { MediaViewerDialog, type MediaItem } from "@/components/mobile/MediaViewerDialog";
import { FamilyFeed } from "@/components/mobile/FamilyFeed";
import { ActivityStrip } from "@/components/mobile/ActivityStrip";
import { useT } from "@/lib/i18n";
import { useDashboardGuard } from "@/lib/route-guards";
import { getCurrentUserFamily } from "@/lib/family-operations";
import { OnboardingProgress } from "@/components/mobile/OnboardingProgress";
import { SetupChecklist } from "@/components/mobile/SetupChecklist";
import { ParentEmptyHome } from "@/components/mobile/ParentEmptyHome";
import { useSetupStore } from "@/lib/setup-store";
import { getStepsForRole } from "@/lib/setup-steps";
import { isDemoAccount } from "@/lib/account-utils";

export const Route = createFileRoute("/parent/home")({
  head: () => ({ meta: [{ title: "Home — myFamily" }] }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { name, parentId, role, email } = useAppState();
  const t = useT();
  const canAccess = useDashboardGuard();
  const setupStore = useSetupStore(parentId);
  const { data: todayCards } = useTodayCards(parentId);
  const { data: upcomingEvents } = useUpcomingEvents(parentId);
  const [dialogKind, setDialogKind] = useState<ActionKind | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [familyCode, setFamilyCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadFamilyCode = async () => {
      try {
        const family = await getCurrentUserFamily();
        if (family) {
          setFamilyCode(family.invite_code);
        }
      } catch (error) {
        console.error("Failed to load family code:", error);
      }
    };
    loadFamilyCode();
  }, []);

  const handleCopyCode = async () => {
    if (!familyCode) return;
    try {
      await navigator.clipboard.writeText(familyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const handleInviteViaSMS = () => {
    if (!familyCode) return;
    const message = `Join my family on myFamily! Use this code to get connected: ${familyCode}`;
    const smsLink = `sms:?body=${encodeURIComponent(message)}`;
    window.location.href = smsLink;
  };

  const openMedia = (m: MediaItem) => { setMediaItem(m); setMediaOpen(true); };
  const greeting = getGreeting(t);

  const steps = getStepsForRole((role as "parent" | "family") || "parent");
  const isSetupComplete = setupStore.getAllDone(steps.map((s) => s.id));
  // Demo accounts are pre-seeded with mock data and should land straight on the
  // full dashboard, not the setup checklist — that's how the app is meant to look.
  const isDemo = isDemoAccount(email);

  // Show empty state if setup is not complete (real accounts only)
  if (setupStore.status !== "loading" && !isSetupComplete && !isDemo) {
    return (
      <Screen
        title={`${greeting},`}
        subtitle={name}
        right={<NotificationBell />}
      >
        <ParentEmptyHome firstName={name} />
      </Screen>
    );
  }

  if (!canAccess || !todayCards || !upcomingEvents) return null;
  return (
    <Screen
      title={`${greeting},`}
      subtitle={name}
      right={
        <NotificationBell />

      }
    >
      <div className="space-y-4">
        {familyCode && (
          <SoftCard className="bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-4">
              <IconBubble><Share2 className="w-6 h-6 text-primary" /></IconBubble>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Invite family member</div>
                <div className="text-lg font-bold font-mono tracking-widest mt-2 mb-3">{familyCode}</div>
                <p className="text-sm text-muted-foreground mb-3">Share this code to invite family members to the app</p>
                <div className="flex gap-2">
                  <Button onClick={handleCopyCode} variant="outline" className="rounded-full h-10 flex-1">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button onClick={handleInviteViaSMS} className="rounded-full h-10 flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Invite via SMS
                  </Button>
                </div>
              </div>
            </div>
          </SoftCard>
        )}

        {todayCards.medicine.name ? (
          <SoftCard tone="blue">
            <div className="flex items-start gap-4">
              <IconBubble><Pill className="w-6 h-6 text-primary" /></IconBubble>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Medicine at {todayCards.medicine.time}</div>
                <div className="text-xl font-semibold mt-1">{todayCards.medicine.name} · {todayCards.medicine.dose}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{todayCards.medicine.food}</div>
                <div className="flex gap-2 mt-4">
                  <Button className="rounded-full h-11 px-5" onClick={() => toast.success("Marked as taken. Family notified.")}>I Took It</Button>
                  <Button variant="secondary" className="rounded-full h-11 px-5" onClick={() => toast("Reminder set for 15 min")}>Remind me later</Button>
                </div>
              </div>
            </div>
          </SoftCard>
        ) : (
          <SoftCard tone="blue" className="opacity-50">
            <div className="flex items-start gap-4">
              <IconBubble><Pill className="w-6 h-6 text-muted-foreground" /></IconBubble>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">No medicine scheduled</div>
                <div className="text-sm text-muted-foreground mt-2">Family can add medicines for you</div>
              </div>
            </div>
          </SoftCard>
        )}

        {todayCards.appointment.doctor ? (
          <SoftCard>
            <div className="flex items-start gap-4">
              <IconBubble><Stethoscope className="w-6 h-6 text-primary" /></IconBubble>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Appointment</div>
                <div className="text-xl font-semibold mt-1">{todayCards.appointment.doctor}</div>
                <div className="text-sm text-muted-foreground">{todayCards.appointment.specialty} · {todayCards.appointment.time}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{todayCards.appointment.address}</div>
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" className="rounded-full h-11 px-5" onClick={() => openMedia({ kind: "text", from: "Dr. Sharma", emoji: "🩺", relation: "Cardiologist", time: "Today · 4:00 PM", caption: "Appointment details", body: `Dr. Sharma · Cardiology\n${todayCards.appointment.time} at ${todayCards.appointment.address}.\nBring last ECG report and morning medicines. Fasting not required.` })}>{t("action.view")}</Button>
                  <Button className="rounded-full h-11 px-5" onClick={() => toast.success(`Navigating to ${todayCards.appointment.address}`)}>{t("action.navigate")}</Button>
                </div>
              </div>
            </div>
          </SoftCard>
        ) : (
          <SoftCard className="opacity-50">
            <div className="flex items-start gap-4">
              <IconBubble><Stethoscope className="w-6 h-6 text-muted-foreground" /></IconBubble>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">No appointment today</div>
                <div className="text-sm text-muted-foreground mt-2">Family can schedule appointments for you</div>
              </div>
            </div>
          </SoftCard>
        )}

        <div className="grid grid-cols-2 gap-3">
          <SoftCard tone="green" className="p-4">
            <IconBubble className="mb-3"><Footprints className="w-5 h-5 text-success" /></IconBubble>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Walk</div>
            <div className="text-lg font-semibold mt-0.5">{todayCards.walk.done.toLocaleString()} / {todayCards.walk.goal.toLocaleString()} steps</div>
            <Button size="sm" className="mt-3 rounded-full h-9 w-full" variant="secondary" onClick={() => toast.success("Walk completed!")}>Done</Button>
          </SoftCard>
          <SoftCard tone="amber" className="p-4">
            <IconBubble className="mb-3"><Droplets className="w-5 h-5 text-warning" /></IconBubble>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Water</div>
            <div className="text-lg font-semibold mt-0.5">{todayCards.water.done} / {todayCards.water.goal} glasses</div>
            <Button size="sm" className="mt-3 rounded-full h-9 w-full" variant="secondary" onClick={() => toast.success("+1 glass")}>Done</Button>
          </SoftCard>
        </div>

        {todayCards.familyMessage.from ? (
          <SoftCard tone="purple">
            <div className="flex items-start gap-4">
              <IconBubble><MessageCircleHeart className="w-6 h-6 text-primary" /></IconBubble>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">From family</div>
                <div className="text-base font-semibold mt-1">{todayCards.familyMessage.from}</div>
                <p className="text-sm text-foreground/80 mt-1">{todayCards.familyMessage.preview}</p>
                <div className="flex gap-2 mt-4">
                  <Button className="rounded-full h-11 px-5" onClick={() => { setDialogKind("call"); setDialogOpen(true); }}>{t("action.call")}</Button>
                  <Button variant="secondary" className="rounded-full h-11 px-5" onClick={() => openMedia({ kind: "voice", from: todayCards.familyMessage.from, emoji: "👩🏽", time: "10 min ago", caption: todayCards.familyMessage.preview, duration: 14 })}>{t("action.playVoice")}</Button>
                </div>
              </div>
            </div>
          </SoftCard>
        ) : null}

        {todayCards.wellness > 0 && (
          <SoftCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Wellness score</div>
                <div className="text-3xl font-bold mt-1">{todayCards.wellness}<span className="text-lg text-muted-foreground">/100</span></div>
              </div>
              <div className="w-20 h-20 rounded-full grid place-items-center" style={{ background: `conic-gradient(var(--success) ${todayCards.wellness * 3.6}deg, var(--muted) 0)` }}>
                <div className="w-16 h-16 rounded-full bg-card grid place-items-center text-sm font-semibold">Good</div>
              </div>
            </div>
          </SoftCard>
        )}

        <FamilyFeed />

        <ActivityStrip />



        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mt-4 mb-2 px-1">Upcoming today</h2>
            <SoftCard className="p-2">
              <ul className="divide-y">
                {upcomingEvents.map((e) => (
                  <li key={e.time} className="flex items-center gap-4 px-3 py-3">
                    <div className="text-sm font-semibold w-16 text-muted-foreground">{e.time}</div>
                    <div className="text-base">{e.label}</div>
                  </li>
                ))}
              </ul>
            </SoftCard>
          </div>
        )}

        <Link
          to="/sos"
          className="fixed bottom-24 right-4 sm:right-[calc(50%-215px+16px)] w-16 h-16 rounded-full bg-destructive text-destructive-foreground shadow-lift grid place-items-center animate-pulse-slow"
          aria-label="Emergency SOS"
        >
          <ShieldAlert className="w-7 h-7" />
          <span className="sr-only">SOS</span>
        </Link>
      </div>

      {dialogKind && (
        <ActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          kind={dialogKind}
          contactName={todayCards.familyMessage.from}
          emoji="👩🏽"
        />
      )}
      <MediaViewerDialog open={mediaOpen} onOpenChange={setMediaOpen} item={mediaItem} />
    </Screen>
  );
}

function IconBubble({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-12 h-12 rounded-2xl bg-card grid place-items-center shrink-0 shadow-soft ${className}`}>{children}</div>;
}

function getGreeting(t: (k: import("@/lib/i18n").TKey) => string) {
  const h = new Date().getHours();
  if (h < 12) return t("g.morning");
  if (h < 17) return t("g.afternoon");
  return t("g.evening");
}
