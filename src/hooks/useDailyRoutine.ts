import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DailyRoutine {
  id: string;
  routine_date: string;
  water_glasses: number;
  sleep_hours: number;
  steps: number;
  exercise_minutes: number;
  calories_consumed: number | null;
}

const today = () => new Date().toISOString().split("T")[0];

export function useDailyRoutine() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const routineQuery = useQuery({
    queryKey: ["daily-routine", user?.id, today()],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_routines")
        .select("*")
        .eq("routine_date", today())
        .maybeSingle();
      if (error) throw error;
      return data as DailyRoutine | null;
    },
  });

  const upsertRoutine = useMutation({
    mutationFn: async (updates: Partial<Omit<DailyRoutine, "id" | "routine_date">>) => {
      if (!user) throw new Error("Not authenticated");
      const existing = routineQuery.data;
      if (existing) {
        const { data, error } = await supabase
          .from("daily_routines")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("daily_routines")
          .insert({ ...updates, user_id: user.id, routine_date: today() })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-routine"] });
    },
  });

  const routine: DailyRoutine = routineQuery.data ?? {
    id: "",
    routine_date: today(),
    water_glasses: 0,
    sleep_hours: 0,
    steps: 0,
    exercise_minutes: 0,
    calories_consumed: null,
  };

  return { routine, isLoading: routineQuery.isLoading, upsertRoutine };
}
