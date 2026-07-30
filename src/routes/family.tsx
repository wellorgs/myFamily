import { createFileRoute } from "@tanstack/react-router";
import { RoleLayout } from "@/components/mobile/RoleLayout";

export const Route = createFileRoute("/family")({
  component: () => <RoleLayout role="family" />,
});
