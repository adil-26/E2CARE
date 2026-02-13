import { useRole } from "@/hooks/useRole";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function RoleRedirect() {
  const { role, loading } = useRole();
  const { user } = useAuth();

  // Check if user has a pending doctor application
  const { data: doctorApp, isLoading: appLoading } = useQuery({
    queryKey: ["doctor_app_redirect", user?.id],
    enabled: !!user && role === "patient",
    queryFn: async () => {
      const { data } = await supabase
        .from("doctors")
        .select("status")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  if (loading || appLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  switch (role) {
    case "doctor":
      return <Navigate to="/doctor" replace />;
    case "admin":
      return <Navigate to="/admin" replace />;
    default:
      // If patient has a pending doctor app, redirect to doctor auth status page
      if (doctorApp?.status === "pending") {
        return <Navigate to="/auth/doctor" replace />;
      }
      return <Navigate to="/dashboard" replace />;
  }
}
