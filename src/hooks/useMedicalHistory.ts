import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface MedicalHistoryData {
  id?: string;
  current_step: number;
  birth_history: Record<string, any>;
  childhood_illnesses: Record<string, any>;
  medical_conditions: Record<string, any>;
  family_history: Record<string, any>;
  gender_health: Record<string, any>;
  surgeries: Record<string, any>;
  allergies: Record<string, any>;
  body_systems: Record<string, any>;
  lifestyle: Record<string, any>;
  is_complete: boolean;
}

const defaultData: MedicalHistoryData = {
  current_step: 1,
  birth_history: {},
  childhood_illnesses: {},
  medical_conditions: {},
  family_history: {},
  gender_health: {},
  surgeries: {},
  allergies: {},
  body_systems: {},
  lifestyle: {},
  is_complete: false,
};

const stepFields: (keyof MedicalHistoryData)[] = [
  "birth_history", "childhood_illnesses", "medical_conditions",
  "family_history", "gender_health", "surgeries", "allergies",
  "body_systems", "lifestyle",
];

export function useMedicalHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["medical-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_history")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data as (MedicalHistoryData & { id: string }) | null;
    },
  });

  const saveStep = useMutation({
    mutationFn: async (updates: Partial<MedicalHistoryData>) => {
      if (!user) throw new Error("Not authenticated");
      const existing = query.data;

      if (existing?.id) {
        const { data, error } = await supabase
          .from("medical_history")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("medical_history")
          .insert({ ...defaultData, ...updates, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-history"] });
    },
    onError: (err) => {
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    },
  });

  const history = query.data ?? defaultData;

  const filledSteps = stepFields.filter(
    (f) => Object.keys(history[f] as Record<string, any>).length > 0
  ).length;
  const completionPercent = Math.round((filledSteps / stepFields.length) * 100);

  return {
    history,
    isLoading: query.isLoading,
    saveStep,
    completionPercent,
    stepFields,
  };
}
