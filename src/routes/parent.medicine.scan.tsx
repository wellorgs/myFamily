import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface MedicineData {
  medicineName: string | null;
  dosage: string | null;
  frequency: string | null;
  instructions: string | null;
  sideEffects: string | null;
  expiryDate: string | null;
  manufacturer: string | null;
}

export const Route = createFileRoute("/parent/medicine/scan")({
  head: () => ({ meta: [{ title: "Scan medicine — myFamily" }] }),
  component: Scan,
});

function Scan() {
  const [step, setStep] = useState<"camera" | "detected" | "sent" | "error">("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [medicineData, setMedicineData] = useState<MedicineData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load detected medicine data from session storage
    if (step === "detected") {
      const stored = sessionStorage.getItem("detectedMedicine");
      if (stored) {
        setMedicineData(JSON.parse(stored));
      }
    }
  }, [step]);

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

    // Send to Gemini Vision API for real OCR
    const imageData = canvasRef.current.toDataURL("image/jpeg").split(",")[1];
    await analyzeMedicineLabel(imageData);
  };

  const analyzeMedicineLabel = async (base64Image: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setCameraError("Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env");
      setStep("error");
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this medicine label image and extract the following information in JSON format:
{
  "medicineName": "name of the medicine",
  "dosage": "dosage amount and unit",
  "frequency": "how often to take (e.g., twice daily)",
  "instructions": "any special instructions (e.g., after food, before food)",
  "sideEffects": "known side effects (if visible)",
  "expiryDate": "expiry date if visible",
  "manufacturer": "manufacturer name if visible"
}

If any field is not visible or unclear, use null. Return ONLY valid JSON, no other text.`,
                  },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error("No response from Gemini API");
      }

      // Parse the JSON response
      const medicineData = JSON.parse(responseText);

      // Store the detected medicine data for display
      sessionStorage.setItem("detectedMedicine", JSON.stringify(medicineData));

      toast.success("Medicine label scanned successfully!");
      setStep("detected");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze medicine label";
      setCameraError(errorMessage);
      toast.error(errorMessage);
      setStep("error");
    }
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
      {step === "detected" && medicineData && (
        <SoftCard className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <div className="font-semibold">Medicine detected</div>
          </div>
          {medicineData.medicineName && (
            <Field label="Name" value={medicineData.medicineName} />
          )}
          {medicineData.dosage && (
            <Field label="Dosage" value={medicineData.dosage} />
          )}
          {medicineData.frequency && (
            <Field label="Frequency" value={medicineData.frequency} />
          )}
          {medicineData.instructions && (
            <Field label="Instructions" value={medicineData.instructions} />
          )}
          {medicineData.manufacturer && (
            <Field label="Manufacturer" value={medicineData.manufacturer} />
          )}
          {medicineData.sideEffects && (
            <Field label="Side effects" value={medicineData.sideEffects} />
          )}
          {medicineData.expiryDate && (
            <Field label="Expiry date" value={medicineData.expiryDate} />
          )}
          <Button
            className="w-full h-12 rounded-2xl"
            onClick={() => {
              setStep("sent");
              toast.success("Sent to family for approval");
            }}
          >
            Send to family for approval
          </Button>
        </SoftCard>
      )}
      {step === "sent" && (
        <SoftCard className="text-center py-10 space-y-3">
          <Clock className="w-12 h-12 mx-auto text-primary" />
          <div className="text-lg font-semibold">Waiting for approval</div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {medicineData?.medicineName ? `${medicineData.medicineName} has been sent to your family for approval.` : "Medicine has been sent to your family for approval."} You'll get reminders automatically once approved.
          </p>
          <Button variant="secondary" className="rounded-full" onClick={() => navigate({ to: "/parent/home" })}>Back home</Button>
        </SoftCard>
      )}
      {step === "error" && (
        <SoftCard className="text-center py-10 space-y-4 border-amber-200 bg-amber-50">
          <AlertCircle className="w-12 h-12 mx-auto text-amber-600" />
          <div className="text-lg font-semibold text-amber-900">Unable to scan medicine</div>
          <p className="text-sm text-amber-800 max-w-xs mx-auto">
            {cameraError || "An error occurred while scanning the medicine label. Please try again."}
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setCameraError(null);
                setStep("camera");
              }}
            >
              Try again
            </Button>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => navigate({ to: "/parent/home" })}
            >
              Back home
            </Button>
          </div>
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
