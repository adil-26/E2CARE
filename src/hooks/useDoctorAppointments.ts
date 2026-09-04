import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/** Keeps appointment queries in sync with live DB changes. */
function useAppointmentsRealtime(keys: string[]) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`appointments-sync-${keys.join("-")}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        keys.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, keys.join("-")]);
}


export type AppointmentWithPatient = {
  id: string;
  user_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  reason: string | null;
  notes: string | null;
  created_at: string;
  patient: {
    full_name: string | null;
    phone: string | null;
    gender: string | null;
    blood_group: string | null;
    medical_id: string | null;
    profile_photo_url: string | null;
  } | null;
};

/** Appointments are linked to patients via user_id (auth user) with no FK to profiles,
 * so profiles must be fetched separately and merged. */
async function attachPatients(rows: any[]): Promise<AppointmentWithPatient[]> {
  if (rows.length === 0) return [];
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, phone, gender, blood_group, medical_id, profile_photo_url")
    .in("user_id", ids);
  const map = new Map((profiles || []).map((p: any) => [p.user_id, p]));
  return rows.map((r) => ({ ...r, patient: map.get(r.user_id) || null }));
}

export function useDoctorAppointments(doctorId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  useAppointmentsRealtime(["doctor_appointments_full", "doctor_today_appointments"]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["doctor_appointments_full", doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", doctorId!)
        .order("appointment_date", { ascending: false })
        .order("start_time", { ascending: false });
      if (error) throw error;
      return attachPatients(data || []);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
      return { id, status };
    },
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: ["doctor_appointments_full"] });
      queryClient.invalidateQueries({ queryKey: ["doctor_today_appointments"] });
      toast({ title: "Appointment updated", description: `Marked as ${status}.` });
    },
    onError: (e: any) =>
      toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const saveNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase.from("appointments").update({ notes }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_appointments_full"] });
      toast({ title: "Consultation notes saved" });
    },
    onError: (e: any) =>
      toast({ title: "Could not save notes", description: e.message, variant: "destructive" }),
  });

  return { appointments, isLoading, updateStatus, saveNotes };
}

export function useAdminAppointments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  useAppointmentsRealtime(["admin_appointments_full", "admin_analytics"]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["admin_appointments_full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, doctors(full_name, specialization)")
        .order("appointment_date", { ascending: false })
        .limit(300);
      if (error) throw error;
      return attachPatients(data || []) as Promise<(AppointmentWithPatient & { doctors: any })[]>;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
      return { id, status };
    },
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin_appointments_full"] });
      queryClient.invalidateQueries({ queryKey: ["admin_analytics"] });
      toast({ title: "Appointment updated", description: `Marked as ${status}.` });
    },
    onError: (e: any) =>
      toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  return { appointments, isLoading, updateStatus };

}
