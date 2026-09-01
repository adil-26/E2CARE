import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdminAnalytics = {
  patients: number;
  doctors: number;
  pendingDoctors: number;
  approvedDoctors: number;
  rejectedDoctors: number;
  appointments: number;
  appointmentsToday: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  reports: number;
  prescriptions: number;
  conversations: number;
  unresolvedAlerts: number;
  newPatientsThisWeek: number;
};

const countOf = async (table: string, apply?: (q: any) => any) => {
  let q = supabase.from(table as any).select("*", { count: "exact", head: true });
  if (apply) q = apply(q);
  const { count } = await q;
  return count || 0;
};

export function useAdminAnalytics() {
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();

  const { data, isLoading } = useQuery<AdminAnalytics>({
    queryKey: ["admin_analytics"],
    queryFn: async () => {
      const [
        patients,
        doctors,
        pendingDoctors,
        approvedDoctors,
        rejectedDoctors,
        appointments,
        appointmentsToday,
        upcoming,
        completed,
        cancelled,
        reports,
        prescriptions,
        conversations,
        unresolvedAlerts,
        newPatientsThisWeek,
      ] = await Promise.all([
        countOf("profiles"),
        countOf("doctors"),
        countOf("doctors", (q) => q.eq("status", "pending")),
        countOf("doctors", (q) => q.eq("status", "approved")),
        countOf("doctors", (q) => q.eq("status", "rejected")),
        countOf("appointments"),
        countOf("appointments", (q) => q.eq("appointment_date", today)),
        countOf("appointments", (q) => q.eq("status", "upcoming")),
        countOf("appointments", (q) => q.eq("status", "completed")),
        countOf("appointments", (q) => q.eq("status", "cancelled")),
        countOf("medical_reports"),
        countOf("prescriptions"),
        countOf("conversations"),
        countOf("clinical_alerts", (q) => q.eq("is_resolved", false)),
        countOf("profiles", (q) => q.gte("created_at", weekAgo)),
      ]);

      return {
        patients,
        doctors,
        pendingDoctors,
        approvedDoctors,
        rejectedDoctors,
        appointments,
        appointmentsToday,
        upcoming,
        completed,
        cancelled,
        reports,
        prescriptions,
        conversations,
        unresolvedAlerts,
        newPatientsThisWeek,
      };
    },
  });

  return { analytics: data, isLoading };
}

export function useRecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_recent_activity"],
    queryFn: async () => {
      const [patientsRes, doctorsRes, reportsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("doctors").select("id, full_name, specialization, status, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("medical_reports").select("id, title, status, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      return {
        patients: patientsRes.data || [],
        doctors: doctorsRes.data || [],
        reports: reportsRes.data || [],
      };
    },
  });

  return { activity: data, isLoading };
}
