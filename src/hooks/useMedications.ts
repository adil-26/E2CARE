import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  schedule: string[];
  prescribed_by: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
}

export function useMedications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const medsQuery = useQuery({
    queryKey: ["medications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((m: any) => ({
        ...m,
        schedule: Array.isArray(m.schedule) ? m.schedule : [],
      })) as Medication[];
    },
  });

  const addMedication = useMutation({
    mutationFn: async (med: Omit<Medication, "id" | "is_active">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("medications")
        .insert({ ...med, user_id: user.id, is_active: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast({ title: "Medication Added", description: "Your medication has been saved." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return { medications: medsQuery.data ?? [], isLoading: medsQuery.isLoading, addMedication };
}
