import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Cards are a white core inside a faint tray ring (card-bz). Tones tint the core.
const toneMap: Record<string, string> = {
  blue: "card-bz bg-tint-blue",
  green: "card-bz bg-tint-green",
  amber: "card-bz bg-tint-amber",
  red: "card-bz bg-tint-red",
  purple: "card-bz bg-tint-purple",
  neutral: "card-bz",
};

export function SoftCard({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof toneMap;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-3xl p-4", toneMap[tone] ?? toneMap.neutral, className)}>
      {children}
    </div>
  );
}

export function StatusDot({ tone }: { tone: "green" | "amber" | "red" | "blue" }) {
  const map = {
    green: "bg-success",
    amber: "bg-warning",
    red: "bg-destructive",
    blue: "bg-primary",
  };
  return <span className={cn("inline-block w-2.5 h-2.5 rounded-full", map[tone])} />;
}
