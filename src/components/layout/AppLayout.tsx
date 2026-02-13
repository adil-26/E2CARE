import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import TopHeader from "./TopHeader";
import MobileNav from "./MobileNav";
import GlobalCallOverlay from "@/components/messages/GlobalCallOverlay";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopHeader />
          <main className="flex-1 overflow-auto p-4 pb-20 lg:p-6 lg:pb-6">
            <Outlet />
          </main>
          <MobileNav />
        </div>
      </div>
      <GlobalCallOverlay />
    </SidebarProvider>
  );
}
