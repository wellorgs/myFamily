import { createFileRoute } from "@tanstack/react-router";
import { Scan } from "@/routes/parent.medicine.scan";

// Family-persona alias for the same scan flow, so a caregiver never lands on a
// /parent/... URL (breadcrumbs, back-nav, and role expectations stay correct).
export const Route = createFileRoute("/family/medicine/scan")({
  head: () => ({ meta: [{ title: "Scan medicine — myFamily" }] }),
  component: Scan,
});
