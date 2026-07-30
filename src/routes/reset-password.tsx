import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firebaseAuth } from "@/integrations/firebase/client";
import { confirmPasswordReset } from "firebase/auth";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const code = typeof window === "undefined"
    ? ""
    : new URLSearchParams(window.location.search).get("oobCode") ?? "";

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col px-6 pt-6 pb-8">
        <Link
          to="/auth"
          aria-label="Back to sign in"
          className="mb-3 -ml-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted focus-visible:bg-muted"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </Link>
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-bold">Choose new password</h1>
          <p className="text-sm text-muted-foreground">
            Firebase email action code lands on this page.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              type="password"
              className="h-12 rounded-2xl"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reset-password-confirm">Confirm password</Label>
            <Input
              id="reset-password-confirm"
              type="password"
              className="h-12 rounded-2xl"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>
        <Button
          className="mt-5 h-12 rounded-2xl text-base"
          onClick={async () => {
            if (!code || password !== confirmPassword) {
              toast.error("Check reset code and passwords");
              return;
            }
            await confirmPasswordReset(firebaseAuth, code, password);
            toast.success("Password saved");
          }}
        >
          Save password
        </Button>
      </div>
    </PhoneFrame>
  );
}
