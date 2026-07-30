import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-stretch justify-center">
      <div className="w-full sm:max-w-[430px] sm:my-6 sm:rounded-[44px] sm:shadow-2xl sm:border sm:border-black/5 bg-background overflow-hidden relative min-h-dvh sm:min-h-[900px] sm:h-[900px]">
        {/* Status bar */}
        <div className="hidden sm:flex items-center justify-between px-8 pt-3 pb-1 text-[13px] font-semibold text-foreground">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="i">••••</span>
            <span>􀙇</span>
            <span>􀛨</span>
          </span>
        </div>
        <div className="h-full flex flex-col">{children}</div>
      </div>
    </div>
  );
}
