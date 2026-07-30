import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Screen({
  title,
  subtitle,
  back,
  right,
  children,
  footer,
  padded = true,
  scroll = true,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean | string;
  right?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  padded?: boolean;
  scroll?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {(title || back || right) && (
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          {back ? (
            typeof back === "string" ? (
              <Link
                to={back}
                aria-label="Back"
                className="w-11 h-11 -ml-2 rounded-full flex items-center justify-center hover:bg-muted"
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
            ) : (
              <button
                aria-label="Back"
                onClick={() => router.history.back()}
                className="w-11 h-11 -ml-2 rounded-full flex items-center justify-center hover:bg-muted"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )
          ) : null}
          <div className="flex-1 min-w-0">
            {title && <h1 className="text-[28px] font-bold leading-tight truncate">{title}</h1>}
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={cn("flex-1 min-h-0", scroll && "overflow-y-auto no-scrollbar", padded && "px-5 pb-nav")}>
        {children}
      </div>
      {footer && <div className="px-5 pb-6 pt-3 border-t bg-background/80 backdrop-blur">{footer}</div>}
    </div>
  );
}
