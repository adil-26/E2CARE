import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useReferrals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's referral code from profile
  const { data: profile } = useQuery({
    queryKey: ["profile_referral", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: referrals = [], ...query } = useQuery({
    queryKey: ["referrals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const sendReferral = useMutation({
    mutationFn: async (email: string) => {
      const code = profile?.referral_code || "E2CARE";
      const { error } = await supabase
        .from("referrals")
        .insert({
          referrer_id: user!.id,
          referred_email: email,
          referral_code: code,
        });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["referrals"] }),
  });

  const referralCode = profile?.referral_code || "";
  const totalEarned = referrals
    .filter((r: any) => r.status === "completed")
    .reduce((sum: number, r: any) => sum + (r.reward_amount || 0), 0);

  return { referrals, referralCode, totalEarned, sendReferral, ...query };
}
