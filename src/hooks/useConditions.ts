import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const CONDITION_TYPES = [
  { type: "blood_sugar", label: "Blood Sugar", unit: "mg/dL", icon: "Droplets", normalRange: "70-100" },
  { type: "blood_pressure_sys", label: "BP Systolic", unit: "mmHg", icon: "Activity", normalRange: "90-120" },
  { type: "blood_pressure_dia", label: "BP Diastolic", unit: "mmHg", icon: "Activity", normalRange: "60-80" },
  { type: "hba1c", label: "HbA1c", unit: "%", icon: "TrendingUp", normalRange: "4-5.6" },
  { type: "thyroid_tsh", label: "TSH", unit: "mIU/L", icon: "Thermometer", normalRange: "0.4-4.0" },
  { type: "peak_flow", label: "Peak Flow", unit: "L/min", icon: "Wind", normalRange: "400-600" },
] as const;

export function useConditions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conditionLogs = [], ...query } = useQuery({
    queryKey: ["condition_logs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("condition_logs")
        .select("*")
        .eq("user_id", user!.id)
        .order("recorded_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const addLog = useMutation({
    mutationFn: async (log: { condition_type: string; value: number; unit: string; notes?: string }) => {
      const { error } = await supabase
        .from("condition_logs")
        .insert({ ...log, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["condition_logs"] }),
  });

  const deleteLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("condition_logs")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["condition_logs"] }),
  });

  return { conditionLogs, addLog, deleteLog, ...query };
}
