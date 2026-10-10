import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell, ChartLineUp, Heartbeat, House, Pill, Sparkle, UserCircle, Users, UsersThree, type Icon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/lib/notifications-store";

type Item = { to: string; label: string; icon: Icon; badge?: boolean; also?: string[] };

// Standard, familiar tabs. Parent: Home, Health, Ask AI, Family, Me. Family: Home, Medicines, Alerts, Circle, Me.
const parentItems: Item[] = [
  { to: "/parent/home", label: "Home", icon: House },
  { to: "/parent/health", label: "Health", icon: Heartbeat },
  { to: "/parent/ai", label: "Ask AI", icon: Sparkle },
  { to: "/parent/family", label: "Family", icon: Users },
  { to: "/parent/profile", label: "Me", icon: UserCircle },
];

const familyItems: Item[] = [
  { to: "/family/dashboard", label: "Home", icon: House, also: ["/family/parents", "/family/insights", "/family/appointments"] },
  { to: "/family/medicines", label: "Medicines", icon: Pill, also: ["/family/medicine"] },
  { to: "/notifications", label: "Alerts", icon: Bell, badge: true },
  { to: "/family/circle", label: "Circle", icon: UsersThree },
  { to: "/family/profile", label: "Me", icon: UserCircle },
];

export function BottomNav({ role }: { role: "parent" | "family" }) {
  const items = role === "parent" ? parentItems : familyItems;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = useUnreadCount();

  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-30 safe-bottom safe-x bg-background/90 backdrop-blur-xl border-t border-border"
      aria-label="Main navigation"
    >
      <ul className="flex items-stretch justify-between px-2 pt-1.5 pb-1">
        {items.map((it) => {
          const active = [it.to, ...(it.also ?? [])].some((p) => pathname === p || pathname.startsWith(p + "/"));
          const Icon = it.icon;
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 h-[50px] transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={25} weight={active ? "fill" : "regular"} />
                <span className="text-[10px] font-semibold">{it.label}</span>
                {it.badge && unread > 0 && (
                  <span className="absolute top-1 left-[54%] min-w-[17px] h-[17px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center ring-2 ring-background">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
