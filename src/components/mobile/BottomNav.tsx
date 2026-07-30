import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Heart, Sparkles, Users, User, LayoutDashboard, Pill, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useT, type TKey } from "@/lib/i18n";

type Item = { to: string; labelKey: TKey; icon: LucideIcon };

const parentItems: Item[] = [
  { to: "/parent/home", labelKey: "nav.home", icon: Home },
  { to: "/parent/health", labelKey: "nav.health", icon: Heart },
  { to: "/parent/ai", labelKey: "nav.ai", icon: Sparkles },
  { to: "/parent/family", labelKey: "nav.family", icon: Users },
  { to: "/parent/profile", labelKey: "nav.profile", icon: User },
];

const familyItems: Item[] = [
  { to: "/family/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/family/parents", labelKey: "nav.parents", icon: Users },
  { to: "/family/medicines", labelKey: "nav.medicines", icon: Pill },
  { to: "/family/insights", labelKey: "nav.insights", icon: LineChart },
  { to: "/family/profile", labelKey: "nav.profile", icon: User },
];

export function BottomNav({ role }: { role: "parent" | "family" }) {
  const items = role === "parent" ? parentItems : familyItems;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();

  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-30 px-4 pt-2 safe-bottom safe-x pointer-events-none"
      aria-label="Main navigation"
    >
      <ul className="flex items-stretch justify-between gap-1 rounded-[28px] border border-black/5 dark:border-white/10 bg-background/85 backdrop-blur-xl shadow-lift px-2 py-1.5 pointer-events-auto">
        {items.map((it) => {
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-colors min-h-[52px]",
                  "focus-visible:ring-2 focus-visible:ring-primary",
                  active
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn(
                  "w-[22px] h-[22px] transition-all",
                  active && "stroke-[2.4]"
                )} />
                <span className={cn(
                  "text-[11px] font-medium transition-all",
                  active && "font-semibold"
                )}>
                  {t(it.labelKey)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
