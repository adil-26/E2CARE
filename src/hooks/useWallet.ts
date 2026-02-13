import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], ...query } = useQuery({
    queryKey: ["wallet_transactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const balance = transactions.length > 0 ? (transactions[0] as any).balance_after : 0;

  return { transactions, balance, ...query };
}
