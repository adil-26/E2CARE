import { useState } from "react";
import { Bell, Check, CheckCheck, Stethoscope, CalendarCheck, Info, AlertTriangle, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { useRole } from "@/hooks/useRole";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  prescription: <Stethoscope className="h-3.5 w-3.5" />,
  appointment: <CalendarCheck className="h-3.5 w-3.5" />,
  message: <MessageSquare className="h-3.5 w-3.5" />,
  call: <Phone className="h-3.5 w-3.5" />,
  warning: <AlertTriangle className="h-3.5 w-3.5" />,
  info: <Info className="h-3.5 w-3.5" />,
};

const TYPE_COLORS: Record<string, string> = {
  prescription: "bg-primary/10 text-primary",
  appointment: "bg-secondary/10 text-secondary-foreground",
  message: "bg-accent/40 text-accent-foreground",
  call: "bg-primary/10 text-primary",
  warning: "bg-destructive/10 text-destructive",
  info: "bg-muted text-muted-foreground",
};

/** Notification types relevant per role */
const ROLE_RELEVANT_TYPES: Record<string, string[]> = {
  patient: ["prescription", "appointment", "message", "call", "info", "warning"],
  doctor: ["appointment", "message", "call", "info"],
  admin: ["info", "warning", "appointment"],
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { role } = useRole();
  const [open, setOpen] = useState(false);

  // Filter notifications by role
  const relevantTypes = ROLE_RELEVANT_TYPES[role || "patient"] || ROLE_RELEVANT_TYPES.patient;
  const filteredNotifications = notifications.filter((n: any) => relevantTypes.includes(n.type));
  const filteredUnread = filteredNotifications.filter((n: any) => !n.is_read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {filteredUnread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {filteredUnread > 9 ? "9+" : filteredUnread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-display text-sm font-semibold">Notifications</h4>
          {filteredUnread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 text-xs"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {filteredNotifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            filteredNotifications.map((n: any) => (
              <div
                key={n.id}
                className={cn(
                  "flex gap-3 border-b px-4 py-3 transition-colors last:border-0",
                  !n.is_read && "bg-primary/5"
                )}
              >
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", TYPE_COLORS[n.type] || TYPE_COLORS.info)}>
                  {NOTIFICATION_ICONS[n.type] || <Bell className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => markAsRead.mutate(n.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
