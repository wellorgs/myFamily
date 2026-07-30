import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useUnreadCount } from "@/lib/notifications-store";

export function NotificationBell({ className = "" }: { className?: string }) {
  const unread = useUnreadCount();
  const label =
    unread > 0
      ? `Notifications, ${unread} unread`
      : "Notifications";
  return (
    <Link
      to="/notifications"
      aria-label={label}
      className={`relative w-11 h-11 rounded-full bg-muted flex items-center justify-center ${className}`}
    >
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold grid place-items-center border-2 border-background"
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
