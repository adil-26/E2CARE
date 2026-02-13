import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "doctor" | "patient";

// Priority: admin > doctor > patient
const ROLE_PRIORITY: Record<string, number> = {
  admin: 3,
  doctor: 2,
  patient: 1,
};

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [allRoles, setAllRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setAllRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (data && data.length > 0) {
        const roles = data.map((d) => d.role as AppRole);
        setAllRoles(roles);
        // Return highest priority role
        const sorted = [...roles].sort(
          (a, b) => (ROLE_PRIORITY[b] || 0) - (ROLE_PRIORITY[a] || 0)
        );
        setRole(sorted[0]);
      } else {
        setAllRoles(["patient"]);
        setRole("patient");
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  return { role, allRoles, loading };
}
