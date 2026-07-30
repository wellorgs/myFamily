import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firebaseAuth } from "@/integrations/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";
import { ChevronLeft, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

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
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            Enter email. Firebase send reset mail here.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            className="h-12 rounded-2xl"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button
          className="mt-5 h-12 rounded-2xl text-base"
          onClick={async () => {
            await sendPasswordResetEmail(firebaseAuth, email);
            toast.success("Reset email sent");
          }}
        >
          Send reset link
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          <Mail className="mr-1 inline h-3 w-3" />
          Continue URL should point to `/reset-password`.
        </p>
      </div>
    </PhoneFrame>
  );
}
