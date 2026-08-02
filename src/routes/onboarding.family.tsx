import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFamily, joinFamilyWithInviteCode } from "@/lib/family-operations";
import { ChevronLeft, Heart, Users, UserPlus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { getState } from "@/lib/app-state";

const TEST_ACCOUNT_FAMILY_CODE = "JOHNSON1";

export const Route = createFileRoute("/onboarding/family")({
  head: () => ({
    meta: [{ title: "Set up your family — myFamily" }],
  }),
  component: FamilySetup,
});

function FamilySetup() {
  const navigate = useNavigate();
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdFamilyCode, setCreatedFamilyCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-join test family for test accounts
  useEffect(() => {
    const email = getState().email;
    if (email && email.endsWith("@family.local")) {
      handleAutoJoinTestFamily();
    }
  }, []);

  const handleAutoJoinTestFamily = async () => {
    try {
      setBusy(true);
      await joinFamilyWithInviteCode(TEST_ACCOUNT_FAMILY_CODE);
      const state = getState();
      navigate({
        to: state.role === "parent" ? "/parent/home" : "/family/dashboard",
      });
    } catch (error) {
      console.error("Auto-join error:", error);
      // Allow manual setup if auto-join fails
      setBusy(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      toast.error("Please enter a family name");
      return;
    }

    try {
      setBusy(true);
      const family = await createFamily({ family_name: familyName.trim() });
      setCreatedFamilyCode(family.invite_code);
      toast.success("Family created");
    } catch (error) {
      console.error("Family creation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create family"
      );
    } finally {
      setBusy(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    try {
      setBusy(true);
      await joinFamilyWithInviteCode(inviteCode.trim());
      toast.success("Joined family");
      const state = getState();
      navigate({
        to: state.role === "parent" ? "/parent/home" : "/family/dashboard",
      });
    } catch (error) {
      console.error("Join family error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to join family"
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCopyCode = async () => {
    if (!createdFamilyCode) return;
    try {
      await navigator.clipboard.writeText(createdFamilyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const handleContinueToDashboard = () => {
    const state = getState();
    navigate({
      to: state.role === "parent" ? "/parent/home" : "/family/dashboard",
    });
  };

  if (createdFamilyCode) {
    return (
      <PhoneFrame>
        <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pt-6 pb-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Family created!</h1>
            <p className="text-sm text-muted-foreground">
              Share this code with family members so they can join
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Your invite code</p>
              <div className="text-4xl font-bold tracking-widest font-mono mb-4">{createdFamilyCode}</div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="w-full h-11 rounded-2xl"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy code
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mb-8">
            Family members can use this 6-character code to join your family group from the "Join" tab
          </p>

          <div className="mt-auto">
            <Button
              onClick={handleContinueToDashboard}
              className="h-12 rounded-2xl text-base w-full"
            >
              Go to dashboard
            </Button>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pt-6 pb-8">
        <Link
          to="/onboarding/profile"
          aria-label="Back to profile"
          className="mb-2 -ml-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted focus-visible:bg-muted"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"
            aria-hidden="true"
          >
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Set up your family</h1>
            <p className="text-sm text-muted-foreground">
              Create or join a family group
            </p>
          </div>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-full bg-muted p-1">
            <TabsTrigger value="create" className="rounded-full">
              <Users className="mr-2 h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="join" className="rounded-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Join
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="family-name">Family name *</Label>
              <Input
                id="family-name"
                placeholder="e.g., The Smiths"
                className="h-12 rounded-2xl"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                disabled={busy}
              />
              <p className="text-xs text-muted-foreground">
                This is how your family will be identified in the app
              </p>
            </div>

            <Button
              onClick={handleCreateFamily}
              disabled={busy || !familyName.trim()}
              className="h-12 rounded-2xl text-base w-full mt-8"
            >
              {busy ? "Creating..." : "Create family"}
            </Button>
          </TabsContent>

          <TabsContent value="join" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite code *</Label>
              <Input
                id="invite-code"
                placeholder="e.g., ABC123"
                className="h-12 rounded-2xl uppercase"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                disabled={busy}
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Ask a family member for their invite code
              </p>
            </div>

            <Button
              onClick={handleJoinFamily}
              disabled={busy || inviteCode.length !== 6}
              className="h-12 rounded-2xl text-base w-full mt-8"
            >
              {busy ? "Joining..." : "Join family"}
            </Button>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground mt-8">
          You can share your invite code with family members to let them join
          your family.
        </p>
      </div>
    </PhoneFrame>
  );
}
