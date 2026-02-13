import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, Loader2, ArrowLeft, Building, GraduationCap, Clock, IndianRupee, Languages, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const specializations = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Endocrinologist",
  "Gastroenterologist",
  "Neurologist",
  "Oncologist",
  "Ophthalmologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Psychiatrist",
  "Pulmonologist",
  "Radiologist",
  "Urologist",
  "ENT Specialist",
  "Gynecologist",
  "Dentist",
  "Other",
];

export default function DoctorRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    specialization: "",
    qualification: "",
    experience_years: 0,
    consultation_fee: 500,
    hospital: "",
    bio: "",
    languages: "English",
  });

  // Check if user already has a pending/approved application
  const { data: existingApplication, isLoading } = useQuery({
    queryKey: ["doctor_application", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("doctors")
        .select("id, status, full_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name || !form.specialization || !form.qualification) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("doctors").insert({
        user_id: user!.id,
        full_name: form.full_name,
        specialization: form.specialization,
        qualification: form.qualification || null,
        experience_years: form.experience_years,
        consultation_fee: form.consultation_fee,
        hospital: form.hospital || null,
        bio: form.bio || null,
        languages: form.languages.split(",").map((l) => l.trim()),
        status: "pending",
        is_available: false,
      });

      if (error) throw error;

      toast({
        title: "Application Submitted! 🎉",
        description: "Your doctor registration is pending admin approval. You'll be notified once approved.",
      });
    } catch (err: any) {
      toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show status if already applied
  if (existingApplication) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="shadow-xl border-border/50">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-4 ${
                existingApplication.status === "approved" ? "bg-green-100 dark:bg-green-900/30" :
                existingApplication.status === "rejected" ? "bg-destructive/10" :
                "bg-warning/10"
              }`}>
                <Stethoscope className={`h-8 w-8 ${
                  existingApplication.status === "approved" ? "text-green-600 dark:text-green-400" :
                  existingApplication.status === "rejected" ? "text-destructive" :
                  "text-warning"
                }`} />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                {existingApplication.status === "approved" ? "Application Approved! ✅" :
                 existingApplication.status === "rejected" ? "Application Rejected" :
                 "Application Pending ⏳"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {existingApplication.status === "approved"
                  ? "Your doctor account is active. You can now access the doctor portal."
                  : existingApplication.status === "rejected"
                  ? "Unfortunately your application was not approved. Please contact support for more details."
                  : "Your application is being reviewed by our admin team. You'll be notified once a decision is made."}
              </p>
              {existingApplication.status === "approved" ? (
                <Button onClick={() => navigate("/doctor")} className="w-full">
                  Go to Doctor Portal
                </Button>
              ) : (
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 shadow-md">
            <Stethoscope className="h-7 w-7 text-secondary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Register as Doctor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Submit your details for admin approval</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Professional Details</CardTitle>
            <CardDescription>All fields marked with * are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <div className="relative">
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Specialization *</Label>
                <Select value={form.specialization} onValueChange={(v) => setForm({ ...form, specialization: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" /> Qualification *
                </Label>
                <Input
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  placeholder="MBBS, MD, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Experience (years)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.experience_years}
                    onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" /> Consultation Fee
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.consultation_fee}
                    onChange={(e) => setForm({ ...form, consultation_fee: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" /> Hospital / Clinic
                </Label>
                <Input
                  value={form.hospital}
                  onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                  placeholder="City Hospital"
                />
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <Languages className="h-3.5 w-3.5" /> Languages (comma-separated)
                </Label>
                <Input
                  value={form.languages}
                  onChange={(e) => setForm({ ...form, languages: e.target.value })}
                  placeholder="English, Hindi, Bengali"
                />
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Bio
                </Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Brief description of your practice and expertise..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Stethoscope className="mr-2 h-4 w-4" />}
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
