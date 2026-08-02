import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeProfile } from "@/lib/family-operations";
import { getState } from "@/lib/app-state";
import { ChevronLeft, Heart } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

const TEST_ACCOUNTS = {
  "mom@family.local": { name: "Sarah Johnson", phone: "9876543210" },
  "dad@family.local": { name: "Michael Johnson", phone: "9876543211" },
  "child@family.local": { name: "Emma Johnson", phone: "9876543212" },
};

export const Route = createFileRoute("/onboarding/profile")({
  head: () => ({
    meta: [{ title: "Complete your profile — myFamily" }],
  }),
  component: ProfileCompletion,
});

function ProfileCompletion() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  // Auto-complete for test accounts
  useEffect(() => {
    const email = getState().email;
    const testData = TEST_ACCOUNTS[email as keyof typeof TEST_ACCOUNTS];
    if (testData) {
      handleAutoComplete(testData.name, testData.phone);
    }
  }, []);

  const handleAutoComplete = async (name: string, testPhone: string) => {
    try {
      setBusy(true);
      await completeProfile({
        full_name: name,
        phone: testPhone,
      });
      navigate({ to: "/onboarding/family" });
    } catch (error) {
      console.error("Auto-complete error:", error);
      // Continue anyway for test accounts
      navigate({ to: "/onboarding/family" });
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    try {
      setBusy(true);
      await completeProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      toast.success("Profile completed");
      navigate({ to: "/onboarding/family" });
    } catch (error) {
      console.error("Profile completion error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to complete profile"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <PhoneFrame>
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pt-6 pb-8">
        <Link
          to="/onboarding"
          aria-label="Back to role selection"
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
            <h1 className="text-2xl font-bold">Complete your profile</h1>
            <p className="text-sm text-muted-foreground">
              Help us know who you are
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full name *</Label>
            <Input
              id="name"
              placeholder="Your full name"
              className="h-12 rounded-2xl"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number (optional)</Label>
            <Input
              id="phone"
              placeholder="9876543210"
              inputMode="numeric"
              className="h-12 rounded-2xl"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={busy}
            />
            <p className="text-xs text-muted-foreground">
              We'll use this for emergency notifications
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <Button
          onClick={handleContinue}
          disabled={busy || !fullName.trim()}
          className="h-12 rounded-2xl text-base w-full"
        >
          {busy ? "Saving..." : "Continue"}
        </Button>
      </div>
    </PhoneFrame>
  );
}
