import { createServerFn } from "@tanstack/react-start";

// Gemini on Vertex AI. On App Hosting the runtime service account supplies credentials,
// so there is no API key to leak. Every call needs a signed-in user.
const PROJECT = "myfamily-a5ec1";
const MODEL = "gemini-3.8-flash";

type Part = { text: string } | { inline_data: { mime_type: string; data: string } };

async function gcpToken(): Promise<string> {
  // local dev: VERTEX_ACCESS_TOKEN=$(gcloud auth print-access-token)
  if (process.env.VERTEX_ACCESS_TOKEN) return process.env.VERTEX_ACCESS_TOKEN;
  const r = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", {
    headers: { "Metadata-Flavor": "Google" },
  });
  if (!r.ok) throw new Error("AI is unavailable right now.");
  return (await r.json()).access_token;
}

async function requireUser(idToken: string) {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.VITE_FIREBASE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!r.ok) throw new Error("Please sign in again.");
}

async function gemini(parts: Part[], opts: { system?: string; json?: boolean } = {}): Promise<string> {
  const res = await fetch(
    `https://aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/global/publishers/google/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${await gcpToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(opts.system && { systemInstruction: { parts: [{ text: opts.system }] } }),
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.2, ...(opts.json && { responseMimeType: "application/json" }) },
      }),
    },
  );
  if (!res.ok) throw new Error(`AI request failed (${res.status}).`);
  const body = await res.json();
  return (body.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim();
}

const parseJson = (t: string) => JSON.parse(t.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
const CARE =
  "You help Indian families look after elderly parents. Plain, warm, short sentences. Never diagnose or change doses; " +
  "for anything worrying, say to call the doctor.";

/* 1. Medicine label */
export type ScannedLabel = { name: string; salt: string; dosage: string; frequency: string; instructions: string; uses: string };
export const scanMedicineLabel = createServerFn({ method: "POST" })
  .inputValidator((d: { image: string; idToken: string }) => d)
  .handler(async ({ data }): Promise<ScannedLabel> => {
    await requireUser(data.idToken);
    const p = parseJson(
      await gemini(
        [
          { text: 'Read this medicine label. JSON only: {"name" (brand),"salt" (active ingredients / composition, from the label or well-known for this brand),"dosage" (strength),"frequency","instructions","uses" (what it is for, 6 words max)}, "" if unknown. Not a medicine: {"error":"x"}.' },
          { inline_data: { mime_type: "image/jpeg", data: data.image } },
        ],
        { json: true },
      ),
    );
    if (p.error || !p.name) throw new Error("Couldn't read a medicine name. Retake the photo in better light.");
    return { name: String(p.name), salt: String(p.salt ?? ""), dosage: String(p.dosage ?? ""), frequency: String(p.frequency ?? ""), instructions: String(p.instructions ?? ""), uses: String(p.uses ?? "") };
  });

/* 1b. Known medicine by name (typed, or after a scan edit) */
export const lookupMedicine = createServerFn({ method: "POST" })
  .inputValidator((d: { idToken: string; name: string }) => d)
  .handler(async ({ data }): Promise<{ salt: string; uses: string; howToTake: string }> => {
    await requireUser(data.idToken);
    const p = parseJson(await gemini([{ text: `Medicine sold in India: "${data.name}". JSON only: {"salt":"active ingredients with strength if standard","uses":"what it is for, 6 words max","howToTake":"usual way, 8 words max"}. Use "" if you are not sure it exists.` }], { system: CARE, json: true }));
    return { salt: String(p.salt ?? ""), uses: String(p.uses ?? ""), howToTake: String(p.howToTake ?? "") };
  });

/* 2. Weekly / daily recap */
export const writeRecap = createServerFn({ method: "POST" })
  .inputValidator((d: { idToken: string; who: string; facts: string }) => d)
  .handler(async ({ data }): Promise<string> => {
    await requireUser(data.idToken);
    return gemini([{ text: `Facts about ${data.who}:\n${data.facts}\n\nWrite a 3 sentence recap for their family. Mention anything to watch.` }], { system: CARE });
  });

/* 5. Ask AI (voice or text; replies in the language asked) */
export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: { idToken: string; question: string; history: { role: "user" | "ai"; text: string }[]; context?: string }) => d)
  .handler(async ({ data }): Promise<string> => {
    await requireUser(data.idToken);
    const chat = data.history.slice(-6).map((m) => `${m.role === "user" ? "Parent" : "Assistant"}: ${m.text}`).join("\n");
    return gemini([{ text: `${data.context ? `Their details: ${data.context}\n` : ""}${chat}\nParent: ${data.question}\nAssistant:` }], {
      system: `${CARE} Reply in the same language the parent used (Hindi, Hinglish, English or another Indian language). Under 60 words.`,
    });
  });

/* 7. Does a new medicine clash with the current ones? */
export const checkInteractions = createServerFn({ method: "POST" })
  .inputValidator((d: { idToken: string; newMedicine: string; current: string[] }) => d)
  .handler(async ({ data }): Promise<{ warn: boolean; note: string }> => {
    await requireUser(data.idToken);
    if (!data.current.length) return { warn: false, note: "" };
    const p = parseJson(
      await gemini(
        [{ text: `New: ${data.newMedicine}\nCurrent: ${data.current.join(", ")}\nKnown significant interactions? JSON only: {"warn":boolean,"note":"one plain sentence, empty if none"}` }],
        { system: CARE, json: true },
      ),
    );
    return { warn: !!p.warn, note: String(p.note ?? "") };
  });

/* 9. Alert text with context */
export const composeAlert = createServerFn({ method: "POST" })
  .inputValidator((d: { idToken: string; event: string; facts: string }) => d)
  .handler(async ({ data }): Promise<string> => {
    await requireUser(data.idToken);
    return gemini([{ text: `Event: ${data.event}\nFacts: ${data.facts}\nOne notification line (max 25 words) for the family: what happened, the key number, what to do.` }], { system: CARE });
  });
