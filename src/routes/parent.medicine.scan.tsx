import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/parent/medicine/scan")({
  head: () => ({ meta: [{ title: "Scan medicine — myFamily" }] }),
  component: Scan,
});

function Scan() {
  const [step, setStep] = useState<"camera" | "detected" | "sent" | "error">("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (step !== "camera") return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraError(null);
        }
      } catch (err) {
        setCameraError(
          err instanceof Error ? err.message : "Camera access denied. Please enable camera permissions."
        );
        setStep("error");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, [step]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    // Simulate OCR - in real app, send to Google Vision or Gemini
    toast.success("Photo captured!");
    setStep("detected");
  };

  return (
    <Screen title="Scan medicine" back={true}>
      {step === "camera" && (
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-3xl bg-slate-900 text-white grid place-items-center relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-6 border-4 border-dashed border-yellow-400 rounded-2xl pointer-events-none" />
            <p className="absolute bottom-6 text-center text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
              Align label within frame
            </p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Position the medicine label inside the frame
          </p>
          <Button className="w-full h-14 rounded-2xl text-base" onClick={capturePhoto}>
            Capture
          </Button>
        </div>
      )}
      {step === "detected" && (
        <SoftCard className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <div className="font-semibold">Medicine detected</div>
          </div>
          <Field label="Name" value="Metformin 500 mg" />
          <Field label="Purpose" value="Blood sugar (Diabetes Type 2)" />
          <Field label="Instructions" value="After food, twice daily" />
          <Field label="Dosage" value="1 tablet" />
          <Field label="Side effects" value="Mild nausea, low appetite" />
          <Button className="w-full h-12 rounded-2xl" onClick={() => { setStep("sent"); toast.success("Sent to Priya for approval"); }}>
            Send to family for approval
          </Button>
        </SoftCard>
      )}
      {step === "sent" && (
        <SoftCard className="text-center py-10 space-y-3">
          <Clock className="w-12 h-12 mx-auto text-primary" />
          <div className="text-lg font-semibold">Waiting for approval</div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Priya will confirm the dosage. You'll get reminders automatically once approved.</p>
          <Button variant="secondary" className="rounded-full" onClick={() => navigate({ to: "/parent/home" })}>Back home</Button>
        </SoftCard>
      )}
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-base mt-0.5">{value}</div>
    </div>
  );
}
