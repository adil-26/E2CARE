import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type DietMeal = {
  name: string;
  time: string;
  items: string[];
  notes?: string;
};

export type DietPlan = {
  id: string;
  patient_id: string;
  doctor_id: string;
  title: string;
  goal: string | null;
  meals: DietMeal[];
  guidelines: { include: string[]; avoid: string[] };
  water_target_glasses: number;
  calorie_target: number | null;
  ai_generated: boolean;
  ai_rationale: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type DietPlanInput = {
  patient_id: string;
  title: string;
  goal?: string;
  meals: DietMeal[];
  guidelines: { include: string[]; avoid: string[] };
  water_target_glasses: number;
  calorie_target?: number | null;
  ai_generated?: boolean;
  ai_rationale?: string | null;
  end_date?: string | null;
};

const normalize = (rows: any[]): DietPlan[] =>
  (rows || []).map((r) => ({
    ...r,
    meals: Array.isArray(r.meals) ? r.meals : [],
    guidelines: r.guidelines && typeof r.guidelines === "object"
      ? { include: r.guidelines.include || [], avoid: r.guidelines.avoid || [] }
      : { include: [], avoid: [] },
  })) as DietPlan[];

/** Diet plans for the signed-in patient. */
export function useMyDietPlans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["diet_plans", "mine", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diet_plans" as any)
        .select("*")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return normalize(data as any[]);
    },
  });
}

/** Diet plans a doctor authored for a specific patient. */
export function useDietPlans(patientId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["diet_plans", patientId, user?.id];

  const { data: plans = [], isLoading } = useQuery({
    queryKey,
    enabled: !!patientId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diet_plans" as any)
        .select("*")
        .eq("patient_id", patientId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return normalize(data as any[]);
    },
  });

  const savePlan = useMutation({
    mutationFn: async (input: DietPlanInput & { id?: string }) => {
      const payload: any = {
        patient_id: input.patient_id,
        doctor_id: user!.id,
        title: input.title,
        goal: input.goal || null,
        meals: input.meals,
        guidelines: input.guidelines,
        water_target_glasses: input.water_target_glasses,
        calorie_target: input.calorie_target ?? null,
        ai_generated: input.ai_generated ?? false,
        ai_rationale: input.ai_rationale ?? null,
        end_date: input.end_date ?? null,
      };
      if (input.id) {
        const { error } = await supabase.from("diet_plans" as any).update(payload).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("diet_plans" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["diet_plans", "mine"] });
      toast({ title: "Diet plan saved", description: "The patient can now see it in their app." });
    },
    onError: (e: any) =>
      toast({ title: "Could not save diet plan", description: e.message, variant: "destructive" }),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("diet_plans" as any).update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diet_plans" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Diet plan deleted" });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  return { plans, isLoading, savePlan, setStatus, deletePlan };
}

/** Ask the AI to draft a diet plan from the patient's medical history. */
export async function generateAiDietPlan(patientId: string, goal?: string) {
  const { data, error } = await supabase.functions.invoke("generate-diet-plan", {
    body: { patient_id: patientId, goal },
  });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any).plan as {
    title: string;
    goal: string;
    calorie_target: number;
    water_target_glasses: number;
    meals: DietMeal[];
    guidelines: { include: string[]; avoid: string[] };
    ai_rationale: string;
  };
}
