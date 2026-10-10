import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { useAppState, useHydrated } from "@/lib/app-state";
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
import { CheckInCard } from "@/components/mobile/ParentHomeBlocks";
import { Gear, HeartStraight, Phone, Pill as PillIcon, Sparkle, UsersThree } from "@phosphor-icons/react";
import { useAiRecap } from "@/lib/use-ai";
import { PersonHero, RecapPill, RecapSheet, TileGrid, useVitals, type Tile } from "@/components/mobile/KinBlocks";

export const Route = createFileRoute("/parent/home")({
  head: () => ({ meta: [{ title: "Home — myFamily" }] }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { name, parentId, role, email, familyId } = useAppState();
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
  // Dismisses today's medicine prompt after the user acts on it (took it / snooze).
  const [medDismissed, setMedDismissed] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);
  const vitals = useVitals(parentId);
  const aiSummary = useAiRecap(recapOpen, name || "this person", `Wellness ${todayCards.wellness}/100; next medicine ${todayCards.medicine.name || "none left"}; steps ${todayCards.walk.done}/${todayCards.walk.goal}; water ${todayCards.water.done}/${todayCards.water.goal}; sleep ${vitals.find((v) => v.key === "sleep")?.value ?? "unknown"}`, recapSummary(todayCards, vitals.find((v) => v.key === "sleep")?.value));

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
  // Time-based greeting is non-deterministic across SSR (server TZ) and client, so
  // gate it behind hydration to avoid a hydration mismatch — neutral until mounted.
  const hydrated = useHydrated();
  const greeting = hydrated ? getGreeting(t) : t("g.morning");

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
        <div className="flex items-center gap-2">
          <Link
            to="/sos"
            className="h-11 px-4 rounded-full bg-destructive text-destructive-foreground shadow-lift flex items-center gap-1.5 text-sm font-bold"
            aria-label="Emergency SOS"
          >
            <ShieldAlert className="w-4 h-4" /> SOS
          </Link>
          <NotificationBell />
        </div>
      }
    >
      <div className="space-y-4">
        <PersonHero name={name || "You"} vitals={vitals} />
        <RecapPill
          text={recapLine(todayCards, name)}
          onOpen={() => setRecapOpen(true)}
        />
        <CheckInCard parentId={parentId} familyId={familyId} email={email} />
        <TileGrid tiles={TILES} />

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

        {todayCards.medicine.name && !medDismissed ? (
          <SoftCard tone="blue">
            <div className="flex items-start gap-4">
              <IconBubble><Pill className="w-6 h-6 text-primary" /></IconBubble>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Medicine at {todayCards.medicine.time}</div>
                <div className="text-xl font-semibold mt-1">{todayCards.medicine.name} · {todayCards.medicine.dose}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{todayCards.medicine.food}</div>
                <div className="flex gap-2 mt-4">
                  <Button className="rounded-full h-11 px-5" onClick={() => { setMedDismissed(true); toast.success("Marked as taken. Family notified."); }}>I Took It</Button>
                  <Button variant="secondary" className="rounded-full h-11 px-5" onClick={() => { setMedDismissed(true); toast("Reminder set for 15 min"); }}>Remind me later</Button>
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

        <FamilyFeed />

        <ActivityStrip />



        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mt-4 mb-2 px-1">Upcoming today</h2>
            <SoftCard className="p-2">
              <ul className="divide-y">
                {upcomingEvents.map((e, i) => (
                  <li key={`${e.time}-${e.label}-${i}`} className="flex items-center gap-4 px-3 py-3">
                    <div className="text-sm font-semibold w-16 text-muted-foreground">{e.time}</div>
                    <div className="text-base">{e.label}</div>
                  </li>
                ))}
              </ul>
            </SoftCard>
          </div>
        )}

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
      <RecapSheet
        open={recapOpen}
        onOpenChange={setRecapOpen}
        who={name || "you"}
        summary={aiSummary}
        sleep={vitals.find((v) => v.key === "sleep")?.value ?? "No data yet"}
        vitalsNote={todayCards.wellness >= 80 ? "All readings look steady today" : "A few readings need a look"}
      />
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

const TILES: Tile[] = [
  { to: "/parent/medicine/scan", label: "Medicine", icon: PillIcon },
  { to: "/parent/health", label: "Health", icon: HeartStraight },
  { to: "/parent/family", label: "Family", icon: UsersThree },
  { to: "/calls", label: "Calls", icon: Phone },
  { to: "/parent/ai", label: "Ask AI", icon: Sparkle },
  { to: "/parent/profile", label: "Settings", icon: Gear },
];

function recapLine(c: { wellness: number; medicine: { name: string } }, name: string) {
  const first = (name || "there").split(" ")[0];
  return c.wellness > 0 ? `Good day, ${first}! Here's how today looks…` : "Add a medicine and a walk to see your day…";
}

function recapSummary(
  c: { wellness: number; medicine: { name: string; time: string }; walk: { done: number; goal: number }; water: { done: number; goal: number } },
  sleep?: string,
) {
  if (c.wellness <= 0) return "There isn't enough data yet. Once medicines, walks and readings are logged, a daily summary shows up here.";
  const med = c.medicine.name ? `Your next medicine is ${c.medicine.name} at ${c.medicine.time}.` : "All of today's medicines are taken.";
  return `Your wellness score is ${c.wellness} out of 100. ${med} You've walked ${c.walk.done.toLocaleString()} of ${c.walk.goal.toLocaleString()} steps and had ${c.water.done} of ${c.water.goal} glasses of water${sleep && sleep !== "—" ? `, after sleeping ${sleep}` : ""}.`;
}
