import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  MessageSquare,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navItems = [
    { title: t.nav.dashboard, icon: LayoutDashboard, path: "/dashboard" },
    { title: t.nav.records, icon: FileText, path: "/records" },
    { title: t.nav.appointments, icon: Calendar, path: "/appointments" },
    { title: t.nav.messages, icon: MessageSquare, path: "/messages" },
    { title: t.nav.aiChat, icon: Bot, path: "/chat" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-area-bottom lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="font-medium">{item.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
