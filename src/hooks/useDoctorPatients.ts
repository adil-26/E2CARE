import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useDoctorProfile() {
  const { user } = useAuth();

  const { data: doctorProfile, ...query } = useQuery({
    queryKey: ["doctor_profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return { doctorProfile, ...query };
}

export function useDoctorPatients(doctorId?: string) {
  const { data: patients = [], ...query } = useQuery({
    queryKey: ["doctor_patients", doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      // Get unique patient IDs from appointments
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("user_id")
        .eq("doctor_id", doctorId!);
      if (error) throw error;

      const uniqueIds = [...new Set(appointments.map((a) => a.user_id))];
      if (uniqueIds.length === 0) return [];

      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", uniqueIds);
      if (pErr) throw pErr;
      return profiles || [];
    },
  });

  return { patients, ...query };
}

export function usePatientFullData(patientUserId?: string) {
  const { data, ...query } = useQuery({
    queryKey: ["patient_full_data", patientUserId],
    enabled: !!patientUserId,
    queryFn: async () => {
      const uid = patientUserId!;

      const [profileRes, vitalsRes, medsRes, reportsRes, conditionsRes, historyRes] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
          supabase.from("vitals").select("*").eq("user_id", uid).order("recorded_at", { ascending: false }).limit(50),
          supabase.from("medications").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("medical_reports").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("condition_logs").select("*").eq("user_id", uid).order("recorded_at", { ascending: false }).limit(100),
          supabase.from("medical_history").select("*").eq("user_id", uid).maybeSingle(),
        ]);

      return {
        profile: profileRes.data,
        vitals: vitalsRes.data || [],
        medications: medsRes.data || [],
        reports: reportsRes.data || [],
        conditionLogs: conditionsRes.data || [],
        medicalHistory: historyRes.data,
      };
    },
  });

  return { patientData: data, ...query };
}
