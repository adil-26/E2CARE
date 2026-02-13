import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DoctorSidebar from "./DoctorSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import GlobalCallOverlay from "@/components/messages/GlobalCallOverlay";

export default function DoctorLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DoctorSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="font-display text-lg font-semibold text-foreground">Doctor Panel</h1>
            </div>
            <NotificationBell />
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <GlobalCallOverlay />
    </SidebarProvider>
  );
}
