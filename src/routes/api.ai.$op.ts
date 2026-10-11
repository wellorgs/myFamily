import { createFileRoute } from "@tanstack/react-router";
import { alertImpl, askImpl, interactionsImpl, lookupImpl, recapImpl, scanLabelImpl } from "@/lib/ai";

// JSON API for the native app. Same functions the web uses; every call needs a Firebase ID token.
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/ai/$op")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          const b = await request.json();
          const t = String(b.idToken ?? "");
          switch (params.op) {
            case "scan": return json(await scanLabelImpl(String(b.image), t));
            case "lookup": return json(await lookupImpl(String(b.name), t));
            case "interactions": return json(await interactionsImpl(String(b.newMedicine), (b.current ?? []).map(String), t));
            case "recap": return json({ text: await recapImpl(String(b.who), String(b.facts), t) });
            case "ask": return json({ text: await askImpl(String(b.question), b.history ?? [], b.context, t) });
            case "alert": return json({ text: await alertImpl(String(b.event), String(b.facts), t) });
            default: return json({ error: "Unknown" }, 404);
          }
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Failed" }, 400);
        }
      },
    },
  },
});
