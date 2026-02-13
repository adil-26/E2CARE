import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useProfilePhoto() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile_photo", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("profile_photo_url, full_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const fullName = profile?.full_name || user?.user_metadata?.full_name || "";
  const initials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return {
    photoUrl: profile?.profile_photo_url || null,
    fullName,
    initials,
  };
}
