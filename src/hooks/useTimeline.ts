import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface TimelineEvent {
  id: string;
  type: "appointment" | "report" | "prescription" | "medication" | "vital";
  title: string;
  description: string;
  date: string;
  status?: string;
}

export function useTimeline() {
  const { user } = useAuth();

  const { data: events = [], ...query } = useQuery({
    queryKey: ["timeline", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = user!.id;
      const timeline: TimelineEvent[] = [];

      // Fetch appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("id, appointment_date, reason, status, doctor_id")
        .eq("user_id", uid)
        .order("appointment_date", { ascending: false })
        .limit(50);

      appointments?.forEach((a) => {
        timeline.push({
          id: a.id,
          type: "appointment",
          title: a.reason || "Doctor Appointment",
          description: `Status: ${a.status}`,
          date: a.appointment_date,
          status: a.status,
        });
      });

      // Fetch medical reports
      const { data: reports } = await supabase
        .from("medical_reports")
        .select("id, title, report_type, report_date, status")
        .eq("user_id", uid)
        .order("report_date", { ascending: false })
        .limit(50);

      reports?.forEach((r) => {
        timeline.push({
          id: r.id,
          type: "report",
          title: r.title,
          description: `${r.report_type} report — ${r.status}`,
          date: r.report_date || r.id,
          status: r.status,
        });
      });

      // Fetch prescriptions
      const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select("id, diagnosis, status, created_at")
        .eq("patient_id", uid)
        .order("created_at", { ascending: false })
        .limit(50);

      prescriptions?.forEach((p) => {
        timeline.push({
          id: p.id,
          type: "prescription",
          title: p.diagnosis || "Prescription",
          description: `Status: ${p.status}`,
          date: p.created_at,
          status: p.status,
        });
      });

      // Fetch medications
      const { data: meds } = await supabase
        .from("medications")
        .select("id, name, dosage, start_date, is_active")
        .eq("user_id", uid)
        .order("start_date", { ascending: false })
        .limit(50);

      meds?.forEach((m) => {
        timeline.push({
          id: m.id,
          type: "medication",
          title: `${m.name} — ${m.dosage}`,
          description: m.is_active ? "Currently active" : "Completed",
          date: m.start_date,
          status: m.is_active ? "active" : "completed",
        });
      });

      // Sort by date descending
      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return timeline;
    },
  });

  return { events, ...query };
}
