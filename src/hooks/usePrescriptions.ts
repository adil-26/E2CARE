import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export function usePrescriptions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: prescriptions = [], ...query } = useQuery({
    queryKey: ["prescriptions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*, doctors(full_name, specialization)")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return { prescriptions, ...query };
}

// Hook for doctors to manage prescriptions
export function useDoctorPrescriptions(doctorId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: prescriptions = [], ...query } = useQuery({
    queryKey: ["doctor_prescriptions", doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*, profiles!prescriptions_patient_id_fkey(full_name, date_of_birth, gender)")
        .eq("doctor_id", doctorId!)
        .order("created_at", { ascending: false });
      // If join fails, fallback without join
      if (error) {
        const { data: fallback, error: err2 } = await supabase
          .from("prescriptions")
          .select("*")
          .eq("doctor_id", doctorId!)
          .order("created_at", { ascending: false });
        if (err2) throw err2;
        return fallback;
      }
      return data;
    },
  });

  const createPrescription = useMutation({
    mutationFn: async (prescription: {
      patient_id: string;
      appointment_id?: string;
      diagnosis: string;
      notes?: string;
      medicines: Medicine[];
    }) => {
      const { error } = await supabase
        .from("prescriptions")
        .insert({
          ...prescription,
          doctor_id: doctorId!,
          medicines: prescription.medicines as any,
        });
      if (error) throw error;

      // Create notification for patient
      await supabase.from("notifications").insert({
        user_id: prescription.patient_id,
        title: "New Prescription",
        message: `Your doctor has prescribed medication for: ${prescription.diagnosis}`,
        type: "prescription",
        link: "/prescriptions",
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctor_prescriptions"] }),
  });

  return { prescriptions, createPrescription, ...query };
}
