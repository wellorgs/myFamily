import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { AccessibilitySettings } from "@/components/mobile/AccessibilitySettings";
import { useAppState } from "@/lib/app-state";
import { signOutApp } from "@/lib/firebase-auth";
import { Bell, Users, Lock, LogOut, Trash2, Crown, ChevronRight, Smartphone, Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getCurrentUserFamily } from "@/lib/family-operations";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/family/profile")({
  head: () => ({ meta: [{ title: "Profile — myFamily" }] }),
  component: Profile,
});

function Profile() {
  const { name } = useAppState();
  const navigate = useNavigate();
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

  const items = [
    { icon: Bell, label: "Notifications", to: "/notifications" },
    { icon: Users, label: "Linked parents", onClick: () => toast("2 parents linked") },
    { icon: Smartphone, label: "Devices", onClick: () => toast("Manage devices") },
    { icon: Lock, label: "Privacy", onClick: () => toast("Privacy") },
    { icon: Crown, label: "Plans & pricing", to: "/pricing" },
  ] as const;

  return (
    <Screen title="Profile">
      <SoftCard className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 grid place-items-center text-2xl">👩🏽</div>
        <div>
          <div className="text-xl font-semibold">{name}</div>
          <div className="text-sm text-muted-foreground">Family member · Premium</div>
        </div>
      </SoftCard>

      {familyCode && (
        <SoftCard className="bg-primary/5 border border-primary/20 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Family invite code</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-lg font-bold font-mono tracking-widest">{familyCode}</div>
              <p className="text-xs text-muted-foreground mt-1">Share this code to invite new family members</p>
            </div>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </SoftCard>
      )}

      <SoftCard className="p-1 mb-4">
        <ul className="divide-y">
          {items.map((it) => {
            const Icon = it.icon;
            const inner = (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center"><Icon className="w-5 h-5" /></div>
                <div className="flex-1">{it.label}</div>
                {"value" in it && it.value && <span className="text-sm text-muted-foreground">{it.value}</span>}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            );
            return (
              <li key={it.label}>
                {"to" in it && it.to ? (
                  <Link to={it.to}>{inner}</Link>
                ) : (
                  <button onClick={"onClick" in it ? it.onClick : undefined} className="w-full text-left">{inner}</button>
                )}
              </li>
            );
          })}
        </ul>
      </SoftCard>

      <div className="mb-4">
        <AccessibilitySettings />
      </div>

      <SoftCard className="p-1">

        <button
          className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-muted rounded-2xl"
          onClick={async () => { await signOutApp(); navigate({ to: "/auth" }); toast("Signed out"); }}
        >
          <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center"><LogOut className="w-5 h-5" /></div>
          <div className="flex-1">Log out</div>
        </button>
        <button
          className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-muted rounded-2xl text-destructive"
          onClick={() => toast.error("Delete account requires email confirmation.")}
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 grid place-items-center"><Trash2 className="w-5 h-5" /></div>
          <div className="flex-1">Delete account</div>
        </button>
      </SoftCard>
    </Screen>
  );
}
