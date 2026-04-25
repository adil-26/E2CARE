import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useDoctorProfile } from "@/hooks/useDoctorPatients";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Leaf, Apple, Loader2, Save, 
  Activity, ActivityIcon, SmilePlus, CheckCircle2, AlertTriangle
} from "lucide-react";

export default function CreateTreatmentPlan() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patient");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { doctorProfile } = useDoctorProfile();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Arrays for dynamic lists
  const [herbs, setHerbs] = useState<string[]>([""]);
  const [dietAvoid, setDietAvoid] = useState<string[]>([""]);
  const [dietInclude, setDietInclude] = useState<string[]>([""]);
  const [lifestyle, setLifestyle] = useState<string[]>([""]);

  const handleDynamicChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string, arr: string[]) => {
    const newArr = [...arr];
    newArr[index] = value;
    setter(newArr);
  };

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>, arr: string[]) => {
    setter([...arr, ""]);
  };

  const submitPlan = async () => {
    if (!title || !patientId) {
      toast({ title: "Validation Error", description: "Title and Patient ID are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanHerbs = herbs.filter(h => h.trim() !== "");
      const cleanAvoid = dietAvoid.filter(d => d.trim() !== "");
      const cleanInclude = dietInclude.filter(d => d.trim() !== "");
      const cleanLifestyle = lifestyle.filter(l => l.trim() !== "");

      // Today's date in YYYY-MM-DD
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30-day default plan

      const { error } = await supabase
        .from('treatment_plans' as any)
        .insert({
          patient_id: patientId,
          doctor_id: user?.id,
          title,
          description,
          start_date: startDate,
          end_date: endDate.toISOString().split('T')[0],
          ayurvedic_herbs: cleanHerbs,
          lifestyle_changes: cleanLifestyle,
          diet_instructions: { include: cleanInclude, avoid: cleanAvoid }
        });

      if (error) throw error;
      
      toast({ title: "Plan Active", description: "The holistic treatment plan has been published." });
      navigate(`/doctor/patients/${patientId}`);
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Holistic Treatment Plan</h1>
          <p className="text-muted-foreground">Orchestrate diet, herbs, and lifestyle modifications into a single plan.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Core Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Plan Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Plan Title Focus</Label>
              <Input placeholder="e.g. 30-Day Pitta Detoxification & Migraine Relief" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Clinical Objective</Label>
              <Textarea 
                placeholder="What is the goal of this integrative plan? Summarize the approach here..."
                value={description} onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Ayurvedic Herbs */}
          <Card>
            <CardHeader className="bg-emerald-500/5 pb-4">
              <CardTitle className="text-emerald-600 dark:text-emerald-500 flex items-center gap-2 text-base">
                <Leaf className="w-4 h-4" /> Herbal Formulations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {herbs.map((h, i) => (
                <Input key={i} placeholder="e.g. Ashwagandha 500mg (Night)" value={h} onChange={(e) => handleDynamicChange(setHerbs, i, e.target.value, herbs)} />
              ))}
              <Button variant="outline" size="sm" onClick={() => addField(setHerbs, herbs)} className="w-full">+ Add Herb</Button>
            </CardContent>
          </Card>

          {/* Lifestyle Changes */}
          <Card>
            <CardHeader className="bg-blue-500/5 pb-4">
              <CardTitle className="text-blue-600 dark:text-blue-500 flex items-center gap-2 text-base">
                <SmilePlus className="w-4 h-4" /> Lifestyle Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {lifestyle.map((l, i) => (
                <Input key={i} placeholder="e.g. 15 mins Pranayama before sunrise" value={l} onChange={(e) => handleDynamicChange(setLifestyle, i, e.target.value, lifestyle)} />
              ))}
              <Button variant="outline" size="sm" onClick={() => addField(setLifestyle, lifestyle)} className="w-full">+ Add Habit</Button>
            </CardContent>
          </Card>
        </div>

        {/* Diet Control */}
        <Card>
          <CardHeader className="bg-amber-500/5 pb-4">
            <CardTitle className="text-amber-600 dark:text-amber-500 flex items-center gap-2 text-base">
              <Apple className="w-4 h-4" /> Dietary Instructions
            </CardTitle>
            <CardDescription>Foods prescribed and strictly prohibited during treatment.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Include</Label>
              {dietInclude.map((d, i) => (
                <Input key={`inc-${i}`} placeholder="e.g. Warm water, ginger tea" value={d} onChange={(e) => handleDynamicChange(setDietInclude, i, e.target.value, dietInclude)} />
              ))}
              <Button variant="ghost" size="sm" onClick={() => addField(setDietInclude, dietInclude)}>+ add</Button>
            </div>
            <div className="space-y-3">
              <Label className="text-destructive flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Avoid Strictly</Label>
              {dietAvoid.map((d, i) => (
                <Input key={`avo-${i}`} placeholder="e.g. Cold dairy, spicy fermented foods" value={d} onChange={(e) => handleDynamicChange(setDietAvoid, i, e.target.value, dietAvoid)} />
              ))}
              <Button variant="ghost" size="sm" onClick={() => addField(setDietAvoid, dietAvoid)}>+ add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end pt-4 pb-12">
          <Button size="lg" className="w-full md:w-auto px-12" onClick={submitPlan} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Publish Treatment Plan
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
