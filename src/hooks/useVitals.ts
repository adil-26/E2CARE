import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Vital {
  id: string;
  vital_type: string;
  value: string;
  unit: string;
  status: string;
  notes: string | null;
  recorded_at: string;
}

export interface VitalInsert {
  vital_type: string;
  value: string;
  unit: string;
  status: string;
  notes?: string;
}

export function useVitals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const vitalsQuery = useQuery({
    queryKey: ["vitals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vitals")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Vital[];
    },
  });

  const latestVitals = vitalsQuery.data
    ? Object.values(
        vitalsQuery.data.reduce<Record<string, Vital>>((acc, v) => {
          if (!acc[v.vital_type]) acc[v.vital_type] = v;
          return acc;
        }, {})
      )
    : [];

  const addVital = useMutation({
    mutationFn: async (vital: VitalInsert) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("vitals")
        .insert({ ...vital, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vitals"] });
      toast({ title: "Vital Logged", description: "Your reading has been saved." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return { vitals: vitalsQuery.data ?? [], latestVitals, isLoading: vitalsQuery.isLoading, addVital };
}
