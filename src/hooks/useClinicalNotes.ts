import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type ClinicalNote = {
  id: string;
  doctor_user_id: string;
  patient_id: string;
  note: string;
  category: string;
  visit_date: string;
  created_at: string;
  updated_at: string;
};

export function useClinicalNotes(patientId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["clinical_notes", patientId, user?.id];

  const { data: notes = [], isLoading } = useQuery({
    queryKey,
    enabled: !!patientId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinical_notes" as any)
        .select("*")
        .eq("patient_id", patientId!)
        .eq("doctor_user_id", user!.id)
        .order("visit_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ClinicalNote[];
    },
  });

  const addNote = useMutation({
    mutationFn: async (input: { note: string; category: string; visit_date: string }) => {
      const { error } = await supabase.from("clinical_notes" as any).insert({
        doctor_user_id: user!.id,
        patient_id: patientId!,
        note: input.note,
        category: input.category,
        visit_date: input.visit_date,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Note saved" });
    },
    onError: (e: any) => toast({ title: "Could not save note", description: e.message, variant: "destructive" }),
  });

  const updateNote = useMutation({
    mutationFn: async (input: { id: string; note: string; category: string }) => {
      const { error } = await supabase
        .from("clinical_notes" as any)
        .update({ note: input.note, category: input.category } as any)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Note updated" });
    },
    onError: (e: any) => toast({ title: "Could not update note", description: e.message, variant: "destructive" }),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clinical_notes" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Note deleted" });
    },
    onError: (e: any) => toast({ title: "Could not delete note", description: e.message, variant: "destructive" }),
  });

  return { notes, isLoading, addNote, updateNote, deleteNote };
}
