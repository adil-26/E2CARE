import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  MessageSquare,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Records", icon: FileText, path: "/records" },
  { title: "Book", icon: Calendar, path: "/appointments" },
  { title: "Chat", icon: MessageSquare, path: "/messages" },
  { title: "AI", icon: Bot, path: "/chat" },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

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
