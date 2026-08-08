import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getState } from "@/lib/app-state";
import {
  signInEmail,
  signInGoogle,
  signUpEmail,
  sendOtp,
  verifyOtp,
} from "@/lib/firebase-auth";
import { getNextAuthRoute } from "@/lib/redirect-utils";
import { Apple, ChevronLeft, Heart, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in - myFamily" },
      { name: "description", content: "Sign in to myFamily to coordinate care with your family." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmailAddress, setSignUpEmailAddress] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const goNext = () => {
    const nextRoute = getNextAuthRoute();
    navigate({ to: nextRoute });
  };

  const handleSignIn = async () => {
    try {
      setBusy(true);
      await signInEmail(email, password);
      goNext();
      toast.success("Signed in");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUpName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!signUpEmailAddress.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      setBusy(true);
      await signUpEmail({
        email: signUpEmailAddress,
        password: signUpPassword,
        fullName: signUpName.trim(),
        role: getState().role,
        language: getState().lang,
      });
      goNext();
      toast.success("Account created");
    } catch (error) {
      // Map raw Firebase auth codes to friendly copy; never surface provider internals.
      const code = (error as { code?: string })?.code ?? "";
      const msg =
        code === "auth/email-already-in-use" ? "That email is already registered. Try signing in." :
        code === "auth/invalid-email" ? "That email address doesn't look right." :
        code === "auth/weak-password" ? "Password must be at least 6 characters." :
        "Couldn't create your account. Please try again.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setBusy(true);
      await signInGoogle();
      goNext();
      toast.success("Signed in with Google");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign in failed");
    } finally {
      setBusy(false);
    }
  };

const handleSendOtp = async () => {
  try {
    setBusy(true);

    let formattedPhone = phone.trim();

    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+91${formattedPhone}`;
    }

    await sendOtp(formattedPhone);

    setOtpSent(true);

    toast.success("OTP sent successfully.");
  } catch (error: any) {
    console.error("========== SEND OTP ERROR ==========");
    console.error(error);
    console.error("CODE:", error?.code);
    console.error("MESSAGE:", error?.message);
    console.error("===============================");

    toast.error(error?.message ?? "Failed to send OTP");
  } finally {
    setBusy(false);
  }
};

const handleVerifyOtp = async () => {
  try {
    setBusy(true);

    await verifyOtp(otp);

    console.log("OTP VERIFIED");

    goNext();

    toast.success("Signed in successfully.");
  } catch (error: any) {
    console.error("========== OTP ERROR ==========");
    console.error(error);
    console.error("CODE:", error?.code);
    console.error("MESSAGE:", error?.message);
    console.error("===============================");

    toast.error(error?.message ?? "OTP verification failed");
  } finally {
    setBusy(false);
  }
};

  return (
    <PhoneFrame>
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pt-6 pb-8">
        <Link
          to="/"
          aria-label="Back to welcome screen"
          className="mb-2 -ml-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted focus-visible:bg-muted"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10" aria-hidden="true">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">myFamily</h1>
            <p className="text-sm text-muted-foreground">Care, together.</p>
          </div>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-full bg-muted p-1">
            <TabsTrigger value="signin" className="rounded-full">Sign in</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="h-12 rounded-2xl" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">Password</Label>
              <div className="relative">
                <Input
                  id="pw"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="h-12 rounded-2xl pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button className="h-12 w-full rounded-2xl text-base" onClick={handleSignIn} disabled={busy}>
              Sign in
            </Button>
            <div className="space-y-3 rounded-3xl bg-muted/60 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4" />
                Sign in with Phone
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  inputMode="numeric"
                  className="h-12 rounded-2xl"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={busy || otpSent}
                />
              </div>

              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">6-digit OTP</Label>

                  <Input
                    id="otp"
                    placeholder="123456"
                    maxLength={6}
                    inputMode="numeric"
                    className="h-12 rounded-2xl tracking-[0.5em]"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                </div>
              )}

              {!otpSent ? (
                <Button
                  className="h-12 w-full rounded-2xl text-base"
                  onClick={handleSendOtp}
                  disabled={busy || phone.length < 10}
                >
                  Send OTP
                </Button>
              ) : (
                <Button
                  className="h-12 w-full rounded-2xl text-base"
                  onClick={handleVerifyOtp}
                  disabled={busy || otp.length !== 6}
                >
                  Verify OTP
                </Button>
              )}
            </div>

            <div id="recaptcha-container" />

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            </TabsContent>

            <TabsContent value="signup" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="h-12 rounded-2xl"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email2">Email</Label>
                <Input
                  id="email2"
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 rounded-2xl"
                  value={signUpEmailAddress}
                  onChange={(e) => setSignUpEmailAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pw2">Password</Label>
                <div className="relative">
                  <Input
                    id="pw2"
                    type={showSignUpPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="h-12 rounded-2xl pr-12"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                  >
                    {showSignUpPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                className="h-12 w-full rounded-2xl text-base"
                onClick={handleSignUp}
                disabled={busy}
              >
                Create account
              </Button>
            </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or continue with
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleGoogle}
                className="flex h-12 items-center justify-center rounded-2xl border bg-card hover:bg-muted"
                aria-label="Continue with Google"
                disabled={busy}
              >
                <span className="text-base font-semibold">G</span>
              </button>

              <button
                onClick={() => toast("Apple sign in not wired yet")}
                className="flex h-12 items-center justify-center rounded-2xl border bg-card hover:bg-muted"
                aria-label="Continue with Apple"
                disabled={busy}
              >
                <Apple className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  if (!otpSent) {
                    handleSendOtp();
                  }
                }}
                className="flex h-12 items-center justify-center rounded-2xl border bg-card hover:bg-muted"
                aria-label="Continue with phone OTP"
                disabled={busy}
              >
                <Phone className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
              By continuing you agree to our Terms and Privacy Policy.
              <br />
              <Mail className="mr-1 inline h-3 w-3" />
              {" "}
              hello@carecircle.app
            </p>
            </div>
            </PhoneFrame>
            );
            }