import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PatientIdCard } from "@/components/patient/PatientIdCard";
import { generateClinicalNarrative } from "@/utils/clinicalNarrative";
import { Loader2, ArrowLeft, HeartPulse, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PublicPatientId() {
  const { patientId } = useParams<{ patientId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-profile", patientId],
    queryFn: async () => {
      const [profileRes, historyRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", patientId)
          .maybeSingle(),
        supabase
          .from("medical_history")
          .select("*")
          .eq("user_id", patientId)
          .maybeSingle()
      ]);
        
      if (profileRes.error) throw profileRes.error;
      return {
        profile: profileRes.data,
        medicalHistory: historyRes.data
      };
    },
    enabled: !!patientId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Loading digital ID...</p>
      </div>
    );
  }

  if (error || !data?.profile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-destructive/10 p-4 rounded-xl mb-4">
          <p className="text-lg font-semibold text-destructive">ID Not Found</p>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">This digital identity card could not be retrieved. Please ensure the link is correct.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" /> Return to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 blur-3xl opacity-50 pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full opacity-50 pointer-events-none translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center space-y-8">
        {/* Brand context on top */}
        <div className="text-center space-y-1 mb-2">
          <h1 className="text-xl font-display font-bold tracking-tight text-foreground">Verified Record</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Digital Pass</p>
        </div>

        {/* The beautiful rendered card */}
        <div className="w-full">
          <PatientIdCard patient={data.profile} patientId={patientId || ''} />
        </div>

        {/* Brief Medical Summary Accordion */}
        {data.medicalHistory && (
          <div className="w-full mt-4 bg-background/95 backdrop-blur-md rounded-2xl border border-destructive/20 shadow-md overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive"></div>
            <Accordion type="single" collapsible className="w-full" defaultValue="medical-summary">
              <AccordionItem value="medical-summary" className="border-none">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 text-destructive font-semibold">
                    <HeartPulse className="w-4 h-4" />
                    Brief Clinical Summary
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <div className="text-left space-y-3">
                    {generateClinicalNarrative(data.medicalHistory).map((sentence, idx) => (
                      <div key={idx} className="flex gap-3 text-sm text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border/50">
                        <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{sentence}</p>
                      </div>
                    ))}
                    {generateClinicalNarrative(data.medicalHistory).length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No significant active conditions recorded.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        <div className="pt-6 border-t border-border/40 w-full text-center space-y-4">
          <p className="text-xs text-muted-foreground">
            This card is an authentic digital identity credential. Secure access requires appropriate gateway authorization.
          </p>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/">Sign In / Go to Portal</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
