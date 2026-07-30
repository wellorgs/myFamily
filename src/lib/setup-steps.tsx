import { Pill, Users, AlertTriangle, Sparkles, Settings } from "lucide-react";
import type { Role } from "@/lib/app-state";

export interface SetupStepDef {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
}

export const PARENT_STEPS: SetupStepDef[] = [
  {
    id: "medicine",
    label: "Add your first medicine",
    description: "Track your daily medications",
    icon: <Pill className="w-6 h-6" />,
    route: "/parent/medicine/scan",
  },
  {
    id: "family",
    label: "Connect your family",
    description: "Invite family members to help care",
    icon: <Users className="w-6 h-6" />,
    route: "/parent/family",
  },
  {
    id: "sos",
    label: "Set up emergency SOS",
    description: "Quick access to help when needed",
    icon: <AlertTriangle className="w-6 h-6" />,
    route: "/sos",
  },
  {
    id: "ai",
    label: "Say hello to your companion",
    description: "AI-powered health assistant",
    icon: <Sparkles className="w-6 h-6" />,
    route: "/parent/ai",
  },
  {
    id: "prefs",
    label: "Make it comfortable to read",
    description: "Text size, contrast, motion, language",
    icon: <Settings className="w-6 h-6" />,
    route: "/parent/profile",
  },
];

export const CHILD_STEPS: SetupStepDef[] = [
  {
    id: "invite",
    label: "Invite your parent",
    description: "Connect with your parent",
    icon: <Users className="w-6 h-6" />,
    route: "/family/parents",
  },
  {
    id: "meds",
    label: "Add their medicines",
    description: "Track medications and schedules",
    icon: <Pill className="w-6 h-6" />,
    route: "/family/medicines",
  },
  {
    id: "appt",
    label: "Schedule an appointment",
    description: "Manage medical appointments",
    icon: <AlertTriangle className="w-6 h-6" />,
    route: "/family/appointments/new",
  },
  {
    id: "plan",
    label: "Choose a plan",
    description: "Select your family plan",
    icon: <Settings className="w-6 h-6" />,
    route: "/pricing",
  },
];

export function getStepsForRole(role: Role): SetupStepDef[] {
  return role === "parent" ? PARENT_STEPS : CHILD_STEPS;
}

export function getStepById(role: Role, stepId: string): SetupStepDef | undefined {
  return getStepsForRole(role).find((s) => s.id === stepId);
}
