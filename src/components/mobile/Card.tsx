import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  blue: "bg-tint-blue",
  green: "bg-tint-green",
  amber: "bg-tint-amber",
  red: "bg-tint-red",
  purple: "bg-tint-purple",
  neutral: "bg-card",
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
    <div
      className={cn(
        "rounded-3xl p-5 shadow-soft border border-black/[0.04] dark:border-white/[0.06]",
        toneMap[tone] ?? toneMap.neutral,
        className,
      )}
    >
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
