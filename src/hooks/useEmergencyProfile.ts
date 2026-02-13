import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface EmergencyProfile {
  fullName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  phone: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  medicalId: string | null;
  pinCode: string | null;
  allergies: string[];
  medications: { name: string; dosage: string; frequency: string }[];
  conditions: { name: string; status: string }[];
}

export function useEmergencyProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["emergency-profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<EmergencyProfile> => {
      // Fetch profile, medical history, and medications in parallel
      const [profileRes, historyRes, medsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user!.id)
          .maybeSingle(),
        supabase
          .from("medical_history")
          .select("allergies, medical_conditions")
          .eq("user_id", user!.id)
          .maybeSingle(),
        supabase
          .from("medications")
          .select("name, dosage, frequency")
          .eq("user_id", user!.id)
          .eq("is_active", true),
      ]);

      if (profileRes.error) throw profileRes.error;

      const profile = profileRes.data;
      const history = historyRes.data;
      const meds = medsRes.data ?? [];

      // Parse allergies from medical history JSON
      const allergies: string[] = [];
      if (history?.allergies) {
        const a = history.allergies as Record<string, any>;
        if (Array.isArray(a.food_allergies)) allergies.push(...a.food_allergies);
        if (Array.isArray(a.drug_allergies)) allergies.push(...a.drug_allergies);
        if (Array.isArray(a.environmental_allergies)) allergies.push(...a.environmental_allergies);
      }

      // Parse conditions
      const conditions: { name: string; status: string }[] = [];
      if (history?.medical_conditions) {
        const mc = history.medical_conditions as Record<string, any>;
        if (Array.isArray(mc.conditions)) {
          mc.conditions.forEach((c: any) => {
            if (c.name) conditions.push({ name: c.name, status: c.status || "active" });
          });
        }
      }

      return {
        fullName: profile?.full_name ?? null,
        dateOfBirth: profile?.date_of_birth ?? null,
        gender: profile?.gender ?? null,
        bloodGroup: profile?.blood_group ?? null,
        phone: profile?.phone ?? null,
        address: profile?.address ?? null,
        emergencyContactName: profile?.emergency_contact_name ?? null,
        emergencyContactPhone: profile?.emergency_contact_phone ?? null,
        medicalId: profile?.medical_id ?? null,
        pinCode: profile?.pin_code ?? null,
        allergies,
        medications: meds.map((m: any) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
        })),
        conditions,
      };
    },
  });
}
