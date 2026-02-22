import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Calendar,
  MessageSquare,
  Bot,
  AlertTriangle,
  Activity,
  Clock,
  Wallet,
  Gift,
  Settings,
  LogOut,
  Heart,
  Stethoscope,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { photoUrl, fullName, initials } = useProfilePhoto();
  const { t } = useLanguage();

  const mainNavItems = [
    { title: t.nav.dashboard, icon: LayoutDashboard, path: "/dashboard" },
    { title: t.nav.history, icon: ClipboardList, path: "/medical-history" },
    { title: t.nav.records, icon: FileText, path: "/records" },
    { title: t.nav.appointments, icon: Calendar, path: "/appointments" },
    { title: t.nav.messages, icon: MessageSquare, path: "/messages" },
    { title: t.nav.aiChat, icon: Bot, path: "/chat" },
  ];

  const moreNavItems = [
    { title: t.nav.emergency, icon: AlertTriangle, path: "/emergency" },
    { title: t.nav.conditions, icon: Activity, path: "/conditions" },
    { title: t.nav.timeline, icon: Clock, path: "/timeline" },
    { title: t.nav.wallet, icon: Wallet, path: "/wallet" },
    { title: t.nav.referrals, icon: Gift, path: "/referrals" },
    { title: t.nav.doctorRegister, icon: Stethoscope, path: "/doctor-register" },
    { title: t.nav.settings, icon: Settings, path: "/settings" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-primary/10 px-3 py-1.5">
            <img src="/logo.png" alt="E2Care" className="h-28 w-auto" />
          </div>
        </div>
      </SidebarHeader>

      <Separator className="mx-4" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.nav.main}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path || location.pathname.startsWith(item.path + "/")}
                    onClick={() => navigate(item.path)}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t.nav.more}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moreNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-full">
            <AvatarImage src={photoUrl || undefined} className="rounded-full object-cover" />
            <AvatarFallback className="rounded-full bg-primary/10 text-sm font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {fullName || t.common.patient}
            </p>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title={t.settings.signOut}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
