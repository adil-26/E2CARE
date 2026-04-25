import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Leaf, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TreatmentPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["patient_treatment_plans", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        // First try joining on profiles explicitly
        let result = await supabase
          .from("treatment_plans" as any)
          .select(`*, doctor:profiles!treatment_plans_doctor_id_fkey(full_name)`)
          .eq("patient_id", user!.id)
          .order("created_at", { ascending: false });
        
        // If that fails, try doctors table directly
        if (result.error) {
          result = await supabase
            .from("treatment_plans" as any)
            .select(`*, doctor:doctors(full_name)`)
            .eq("patient_id", user!.id)
            .order("created_at", { ascending: false });
        }

        // If it still fails, fallback to flat query to ensure data is displayed
        if (result.error) {
          console.warn("Join relation failed, falling back to flat table:", result.error);
          
          const flatResult = await supabase
            .from("treatment_plans" as any)
            .select("*")
            .eq("patient_id", user!.id)
            .order("created_at", { ascending: false });
            
          if (flatResult.error) {
             setErrorMsg(flatResult.error.message);
             return [];
          }
          
          return flatResult.data?.map((plan: any) => ({
             ...plan,
             doctor: { full_name: "Your Doctor" } // Default safely mapped
          })) || [];
        }

        setErrorMsg(null); // Clear errors if successful
        return result.data || [];
      } catch (err: any) {
         setErrorMsg(err.message || String(err));
         return [];
      }
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading active treatment plans...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
         <h1 className="font-display text-2xl font-bold text-foreground">Treatment Plans</h1>
          <p className="text-sm text-muted-foreground">Your holistic protocols prescribed by your doctors.</p>
        </div>
      </div>

      {errorMsg && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-6 text-center text-destructive flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <p className="font-semibold">Query Error Failed:</p>
            <p className="text-sm font-mono">{errorMsg}</p>
          </CardContent>
        </Card>
      )}

      {!errorMsg && plans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            You do not have any active treatment plans at the moment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {plans.map((plan: any) => {
            const doctorObj = Array.isArray(plan.doctor) ? plan.doctor[0] : plan.doctor;
            const docName = doctorObj?.full_name || "Doctor";
            
            return (
              <Card key={plan.id} className="shadow-md border-primary/20 overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-primary flex items-center gap-2">
                        <Activity className="w-5 h-5" /> {plan.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Prescribed by Dr. {docName} <br/>
                        Active: {plan.start_date} to {plan.end_date}
                      </CardDescription>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {plan.description && <p className="text-sm text-foreground">{plan.description}</p>}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Herbs */}
                    {plan.ayurvedic_herbs?.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-emerald-600 tracking-wider flex items-center gap-1">
                          <Leaf className="w-4 h-4"/> Ayurvedic Herbs
                        </label>
                        <ul className="text-sm space-y-2 pl-5 list-disc text-foreground">
                          {plan.ayurvedic_herbs.map((h: string, i: number) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {/* Lifestyle */}
                    {plan.lifestyle_changes?.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-blue-600 tracking-wider">Lifestyle Adjustments</label>
                        <ul className="text-sm space-y-2 pl-5 list-disc text-foreground">
                          {plan.lifestyle_changes.map((l: string, i: number) => <li key={i}>{l}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Diet */}
                    {(plan.diet_instructions?.include?.length > 0 || plan.diet_instructions?.avoid?.length > 0) && (
                      <div className="space-y-3 lg:col-span-2 bg-muted/30 p-4 rounded-xl border">
                         <label className="text-xs font-bold uppercase text-amber-600 tracking-wider block">Dietary Protocol</label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                           <div>
                             <span className="text-green-600 flex items-center gap-1.5 font-semibold text-base mb-2">
                               <CheckCircle2 className="w-4 h-4"/> Include in Diet
                             </span>
                             <ul className="pl-5 space-y-1.5 list-disc text-foreground">
                               {plan.diet_instructions.include?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                             </ul>
                           </div>
                           <div>
                             <span className="text-destructive flex items-center gap-1.5 font-semibold text-base mb-2">
                               <AlertTriangle className="w-4 h-4"/> Strictly Avoid
                             </span>
                             <ul className="pl-5 space-y-1.5 list-disc text-foreground">
                               {plan.diet_instructions.avoid?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                             </ul>
                           </div>
                         </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
