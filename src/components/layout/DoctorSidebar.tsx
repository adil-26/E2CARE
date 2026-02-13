import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDoctorProfile } from "@/hooks/useDoctorPatients";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Pill,
  MessageSquare,
  LogOut,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/doctor" },
  { title: "My Patients", icon: Users, path: "/doctor/patients" },
  { title: "Messages", icon: MessageSquare, path: "/doctor/messages" },
  { title: "Appointments", icon: Calendar, path: "/doctor/appointments" },
  { title: "Prescriptions", icon: Pill, path: "/doctor/prescriptions" },
];

export default function DoctorSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { doctorProfile } = useDoctorProfile();

  const name = doctorProfile?.full_name || user?.user_metadata?.full_name || "Doctor";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-primary shadow-md">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-sidebar-foreground">E2Care</h2>
            <p className="text-xs text-muted-foreground">Doctor Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <Separator className="mx-4" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path || (item.path !== "/doctor" && location.pathname.startsWith(item.path))}
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
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-secondary/10 text-sm font-medium text-secondary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">Dr. {name}</p>
            <p className="truncate text-xs text-muted-foreground">{doctorProfile?.specialization}</p>
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
