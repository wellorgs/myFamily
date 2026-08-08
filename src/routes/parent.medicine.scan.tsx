import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, Clock, AlertCircle, Loader, Keyboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { getMedicineOCR } from "@/lib/gemini-ai";
import { useAppState } from "@/lib/app-state";
import { useSetupStore } from "@/lib/setup-store";
import { isMockAccount } from "@/lib/account-utils";
import { saveScannedMedicine } from "@/lib/medicine-operations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MedicineData {
  medicineName: string | null;
  dosage: string | null;
  frequency: string | null;
  instructions: string | null;
  sideEffects: string | null;
  expiryDate: string | null;
  manufacturer: string | null;
  medicineType?: string | null;
}

export const Route = createFileRoute("/parent/medicine/scan")({
  head: () => ({ meta: [{ title: "Scan medicine — myFamily" }] }),
  component: Scan,
});

export function Scan() {
  const [step, setStep] = useState<"camera" | "detected" | "sent" | "error" | "processing" | "manual">("camera");
  const [manualName, setManualName] = useState("");
  const [manualDosage, setManualDosage] = useState("");
  const [manualFrequency, setManualFrequency] = useState("");
  const [manualInstructions, setManualInstructions] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [medicineData, setMedicineData] = useState<MedicineData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { parentId, familyId, email, role } = useAppState();
  const homeRoute = role === "parent" ? "/parent/home" : "/family/dashboard";
  const setupStore = useSetupStore(parentId);
  const [saving, setSaving] = useState(false);

  const handleSendForApproval = async () => {
    if (!medicineData?.medicineName) return;
    setSaving(true);
    try {
      // Real accounts persist a pending medicine; demo/mock accounts skip the
      // write (their data is seeded) but still complete the setup step.
      if (!isMockAccount(email)) {
        await saveScannedMedicine({
          name: medicineData.medicineName,
          dosage: medicineData.dosage,
          frequency: medicineData.frequency,
          instructions: medicineData.instructions,
          familyId,
        });
      }
      setupStore.markStepDone("medicine");
      setStep("sent");
      toast.success("Sent to family for approval");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save medicine. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualName.trim()) {
      toast.error("Enter the medicine name.");
      return;
    }
    // The "detected" step normally loads from sessionStorage (OCR result); clear
    // any stale entry so it doesn't clobber this manually-entered data.
    sessionStorage.removeItem("detectedMedicine");
    setMedicineData({
      medicineName: manualName.trim(),
      dosage: manualDosage.trim() || null,
      frequency: manualFrequency.trim() || null,
      instructions: manualInstructions.trim() || null,
      sideEffects: null,
      expiryDate: null,
      manufacturer: null,
    });
    setStep("detected");
  };

  useEffect(() => {
    // Load detected medicine data from session storage
    if (step === "detected") {
      const stored = sessionStorage.getItem("detectedMedicine");
      if (stored) {
        try {
          setMedicineData(JSON.parse(stored));
        } catch {
          setCameraError("Failed to load medicine data");
        }
      }
    }
  }, [step]);

  useEffect(() => {
    if (step !== "camera") return;

    const startCamera = async () => {
      try {
        console.log("Requesting camera access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraError(null);
          console.log("Camera started successfully");
          toast.success("Camera ready. Position medicine label and tap Capture.");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Camera access denied";
        console.error("Camera error:", errorMsg);
        setCameraError(errorMsg);
        setStep("error");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => {
          track.stop();
          console.log("Camera stopped");
        });
      }
    };
  }, [step]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setCameraError("Camera not ready. Please try again.");
      return;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) {
      setCameraError("Failed to capture image");
      return;
    }

    try {
      console.log("Capturing photo...");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      if (canvasRef.current.width === 0 || canvasRef.current.height === 0) {
        throw new Error("Video not ready. Please wait a moment and try again.");
      }

      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL("image/jpeg", 0.8).split(",")[1];

      if (!imageData) {
        throw new Error("Failed to capture image data");
      }

      console.log("Image captured, sending to DeepSeek Vision API...");
      setStep("processing");
      setIsLoading(true);
      await analyzeMedicineLabel(imageData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to capture image";
      console.error("Capture error:", errorMsg);
      setCameraError(errorMsg);
      setStep("error");
      setIsLoading(false);
    }
  };

  const analyzeMedicineLabel = async (base64Image: string) => {
    try {
      console.log("Calling DeepSeek Vision API for medicine OCR...");
      setIsLoading(true);

      // Use DeepSeek-VL2 via gemini-ai module
      const ocrResult = await getMedicineOCR(base64Image);

      const medicineData: MedicineData = {
        medicineName: ocrResult.name || null,
        dosage: ocrResult.dosage || null,
        frequency: ocrResult.frequency || null,
        instructions: ocrResult.instructions || null,
        sideEffects: null,
        expiryDate: null,
        manufacturer: null,
      };

      // Validate that we got at least a medicine name
      if (!medicineData.medicineName) {
        throw new Error(
          "Could not identify medicine name from label. Please ensure the label is clearly visible and well-lit."
        );
      }

      console.log("Parsed medicine data:", medicineData);

      // Store the detected medicine data for display
      sessionStorage.setItem("detectedMedicine", JSON.stringify(medicineData));

      toast.success("Medicine label scanned successfully!");
      setIsLoading(false);
      setStep("detected");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze medicine label";
      console.error("Analysis error:", errorMessage);
      setCameraError(errorMessage);
      setIsLoading(false);
      setStep("error");
      toast.error(errorMessage);
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
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-6 border-4 border-dashed border-yellow-400 rounded-2xl pointer-events-none" />
            <p className="absolute bottom-6 text-center text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
              Position label clearly within frame
            </p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Works for tablets, drops, sprays, syrups, and any medicine packaging
          </p>
          <Button className="w-full h-14 rounded-2xl text-base" onClick={capturePhoto} disabled={isLoading}>
            {isLoading ? "Processing..." : "Capture"}
          </Button>
          <Button variant="ghost" className="w-full rounded-full" onClick={() => setStep("manual")}>
            <Keyboard className="w-4 h-4 mr-2" /> No camera? Enter details manually
          </Button>
        </div>
      )}

      {step === "processing" && (
        <SoftCard className="text-center py-10 space-y-4">
          <Loader className="w-12 h-12 mx-auto animate-spin text-primary" />
          <div className="text-lg font-semibold">Analyzing medicine label...</div>
          <p className="text-sm text-muted-foreground">
            Using AI to extract information from the label. This may take a few seconds.
          </p>
        </SoftCard>
      )}

      {step === "detected" && medicineData && (
        <SoftCard className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <div className="font-semibold">Medicine detected</div>
          </div>
          {medicineData.medicineType && (
            <Field label="Type" value={medicineData.medicineType} />
          )}
          {medicineData.medicineName && (
            <Field label="Name" value={medicineData.medicineName} />
          )}
          {medicineData.dosage && <Field label="Dosage" value={medicineData.dosage} />}
          {medicineData.frequency && <Field label="Frequency" value={medicineData.frequency} />}
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
            onClick={handleSendForApproval}
            disabled={saving}
          >
            {saving ? "Sending…" : "Send to family for approval"}
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl"
            onClick={() => {
              setCameraError(null);
              setStep("camera");
            }}
          >
            Scan another
          </Button>
        </SoftCard>
      )}

      {step === "sent" && (
        <SoftCard className="text-center py-10 space-y-3">
          <Clock className="w-12 h-12 mx-auto text-primary" />
          <div className="text-lg font-semibold">Waiting for approval</div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {medicineData?.medicineName
              ? `${medicineData.medicineName} has been sent to your family for approval.`
              : "Medicine has been sent to your family for approval."}{" "}
            You'll get reminders automatically once approved.
          </p>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => navigate({ to: homeRoute })}
          >
            Back home
          </Button>
        </SoftCard>
      )}

      {step === "error" && (
        <SoftCard className="text-center py-10 space-y-4 border-amber-200 bg-amber-50">
          <AlertCircle className="w-12 h-12 mx-auto text-amber-600" />
          <div className="text-lg font-semibold text-amber-900">Unable to scan medicine</div>
          <p className="text-sm text-amber-800 max-w-xs mx-auto font-medium">{cameraError}</p>
          <p className="text-xs text-amber-700 max-w-xs mx-auto">
            💡 Tips: Ensure good lighting, label is clear and not blurry, and the medicine packaging is fully
            visible
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setCameraError(null);
                setIsLoading(false);
                setStep("camera");
              }}
            >
              Try again
            </Button>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => navigate({ to: homeRoute })}
            >
              Back home
            </Button>
          </div>
          <Button
            variant="ghost"
            className="rounded-full mt-1"
            onClick={() => { setCameraError(null); setStep("manual"); }}
          >
            <Keyboard className="w-4 h-4 mr-2" /> Enter medicine details manually
          </Button>
        </SoftCard>
      )}

      {step === "manual" && (
        <SoftCard className="space-y-4">
          <div className="text-lg font-semibold">Add medicine manually</div>
          <div>
            <Label>Medicine name</Label>
            <Input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="e.g. Metformin" className="h-12 rounded-2xl mt-1" />
          </div>
          <div>
            <Label>Dosage</Label>
            <Input value={manualDosage} onChange={(e) => setManualDosage(e.target.value)} placeholder="e.g. 500 mg" className="h-12 rounded-2xl mt-1" />
          </div>
          <div>
            <Label>Frequency</Label>
            <Input value={manualFrequency} onChange={(e) => setManualFrequency(e.target.value)} placeholder="e.g. Twice daily" className="h-12 rounded-2xl mt-1" />
          </div>
          <div>
            <Label>Instructions</Label>
            <Input value={manualInstructions} onChange={(e) => setManualInstructions(e.target.value)} placeholder="e.g. After food" className="h-12 rounded-2xl mt-1" />
          </div>
          <Button className="w-full h-12 rounded-2xl" onClick={handleManualSubmit}>Continue</Button>
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
