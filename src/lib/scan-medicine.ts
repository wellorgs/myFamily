import { createServerFn } from "@tanstack/react-start";

export type ScannedLabel = { name: string; dosage: string; frequency: string; instructions: string };

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const PROMPT =
  'Read this medicine label. Reply with JSON only: {"name","dosage","frequency","instructions"}. ' +
  'Use "" for anything not printed. If the image is not a medicine, reply {"error":"not a medicine"}.';

/** Gemini label reader. Runs on the server so the key never reaches the browser. */
export const scanMedicineLabel = createServerFn({ method: "POST" })
  .inputValidator((d: { image: string; idToken: string }) => d)
  .handler(async ({ data }): Promise<ScannedLabel> => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Scanning is not set up yet.");

    // Only signed-in users may spend the key.
    const who = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.VITE_FIREBASE_API_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: data.idToken }) },
    );
    if (!who.ok) throw new Error("Please sign in again.");

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: "image/jpeg", data: data.image } }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
      }),
    });
    if (!res.ok) throw new Error(`Scan failed (${res.status}). Try again or enter it manually.`);
    const body = await res.json();
    const text: string = body.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    if (parsed.error || !parsed.name) throw new Error("Couldn't read a medicine name. Retake the photo in better light.");
    return {
      name: String(parsed.name),
      dosage: String(parsed.dosage ?? ""),
      frequency: String(parsed.frequency ?? ""),
      instructions: String(parsed.instructions ?? ""),
    };
  });
