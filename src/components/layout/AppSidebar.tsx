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

const mainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Medical History", icon: ClipboardList, path: "/medical-history" },
  { title: "Reports & Records", icon: FileText, path: "/records" },
  { title: "Appointments", icon: Calendar, path: "/appointments" },
  { title: "Messages", icon: MessageSquare, path: "/messages" },
  { title: "AI Assistant", icon: Bot, path: "/chat" },
];

const moreNavItems = [
  { title: "Emergency", icon: AlertTriangle, path: "/emergency" },
  { title: "Conditions", icon: Activity, path: "/conditions" },
  { title: "Timeline", icon: Clock, path: "/timeline" },
  { title: "Wallet", icon: Wallet, path: "/wallet" },
  { title: "Referrals", icon: Gift, path: "/referrals" },
  { title: "Register as Doctor", icon: Stethoscope, path: "/doctor-register" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { photoUrl, fullName, initials } = useProfilePhoto();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl health-gradient shadow-md">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-sidebar-foreground">E2Care</h2>
            <p className="text-xs text-muted-foreground">Patient Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <Separator className="mx-4" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
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
          <SidebarGroupLabel>More</SidebarGroupLabel>
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
              {fullName || "Patient"}
            </p>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
