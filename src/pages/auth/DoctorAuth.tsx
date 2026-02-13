import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Mail, Lock, User, Loader2, ArrowLeft, Upload, FileCheck, GraduationCap, Building, Clock, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

const specializations = [
  "General Physician", "Cardiologist", "Dermatologist", "Endocrinologist",
  "Gastroenterologist", "Neurologist", "Oncologist", "Ophthalmologist",
  "Orthopedic Surgeon", "Pediatrician", "Psychiatrist", "Pulmonologist",
  "Radiologist", "Urologist", "ENT Specialist", "Gynecologist", "Dentist", "Other",
];

export default function DoctorAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [consultationFee, setConsultationFee] = useState(500);
  const [hospital, setHospital] = useState("");
  const [bio, setBio] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { allRoles, loading: roleLoading } = useRole();

  // Check if logged-in user already has a doctor application
  const { data: doctorApp, isLoading: appLoading } = useQuery({
    queryKey: ["doctor_app_auth", user?.id],
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

  useEffect(() => {
    if (!user || roleLoading) return;
    // If user has the doctor role, go to doctor portal
    if (allRoles.includes("doctor")) {
      navigate("/doctor", { replace: true });
    }
    // Otherwise stay on this page — the doctor application status or register form will show
  }, [user, allRoles, roleLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation Error", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      const message = error.message.includes("Invalid login")
        ? "Invalid email or password."
        : error.message.includes("Email not confirmed")
        ? "Please verify your email before signing in."
        : error.message;
      toast({ title: "Login Failed", description: message, variant: "destructive" });
    }
  };

  const uploadFile = async (file: File, userId: string, type: "license" | "certificate") => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${type}.${ext}`;
    const { error } = await supabase.storage
      .from("doctor-documents")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = await supabase.storage
      .from("doctor-documents")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    return data?.signedUrl || path;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(signupName);
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      if (!specialization) throw new Error("Please select a specialization");
      if (!qualification) throw new Error("Please enter your qualification");
      if (!licenseNumber) throw new Error("Please enter your license number");
      if (!licenseFile) throw new Error("Please upload your license document");
      if (!certificateFile) throw new Error("Please upload your certificate");
    } catch (err: any) {
      toast({ title: "Validation Error", description: err.message || err.errors?.[0]?.message, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error: signUpError } = await signUp(signupEmail, signupPassword, signupName);
      if (signUpError) throw signUpError;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Account Created!",
          description: "Please verify your email, then log in to complete your doctor registration.",
        });
        setIsLoading(false);
        return;
      }

      const licenseUrl = await uploadFile(licenseFile!, session.user.id, "license");
      const certificateUrl = await uploadFile(certificateFile!, session.user.id, "certificate");

      const { error: docError } = await supabase.from("doctors").insert({
        user_id: session.user.id,
        full_name: signupName,
        specialization,
        qualification,
        license_number: licenseNumber,
        license_url: licenseUrl,
        certificate_url: certificateUrl,
        experience_years: experienceYears,
        consultation_fee: consultationFee,
        hospital: hospital || null,
        bio: bio || null,
        status: "pending",
        is_available: false,
      });

      if (docError) throw docError;

      toast({
        title: "Registration Submitted! 🎉",
        description: "Your doctor application is pending admin approval. You'll be notified once approved.",
      });
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth and application status
  if (user && (roleLoading || appLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in and has a doctor application, show status
  if (user && doctorApp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="shadow-xl border-border/50">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-4 ${
                doctorApp.status === "approved" ? "bg-green-100 dark:bg-green-900/30" :
                doctorApp.status === "rejected" ? "bg-destructive/10" :
                "bg-warning/10"
              }`}>
                <Stethoscope className={`h-8 w-8 ${
                  doctorApp.status === "approved" ? "text-green-600 dark:text-green-400" :
                  doctorApp.status === "rejected" ? "text-destructive" :
                  "text-warning"
                }`} />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                {doctorApp.status === "approved" ? "Application Approved! ✅" :
                 doctorApp.status === "rejected" ? "Application Rejected" :
                 "Application Pending ⏳"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {doctorApp.status === "approved"
                  ? "Your doctor account is active. You can now access the doctor portal."
                  : doctorApp.status === "rejected"
                  ? "Unfortunately your application was not approved. Please contact support for more details."
                  : "Your application is being reviewed by our admin team. You'll be notified once a decision is made."}
              </p>
              {doctorApp.status === "approved" ? (
                <Button onClick={() => navigate("/doctor")} className="w-full">
                  Go to Doctor Portal
                </Button>
              ) : (
                <Button variant="outline" onClick={() => navigate("/auth")} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
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
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 shadow-md">
            <Stethoscope className="h-7 w-7 text-secondary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Doctor Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in or register as a doctor</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-4">
              {/* LOGIN TAB */}
              <TabsContent value="login" className="mt-0">
                <CardTitle className="mb-1 text-lg">Welcome back, Doctor</CardTitle>
                <CardDescription className="mb-4">Sign in to access your doctor portal</CardDescription>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="email" placeholder="doctor@example.com" className="pl-10" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign In
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER TAB */}
              <TabsContent value="register" className="mt-0">
                <CardTitle className="mb-1 text-lg">Doctor Registration</CardTitle>
                <CardDescription className="mb-4">Submit your details for admin approval</CardDescription>
                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Dr. John Smith" className="pl-10" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="email" placeholder="doctor@gmail.com" className="pl-10" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="Min 6 characters" className="pl-10" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-2">
                    <Label>Specialization *</Label>
                    <Select value={specialization} onValueChange={setSpecialization}>
                      <SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger>
                      <SelectContent>
                        {specializations.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> Qualification *</Label>
                    <Input placeholder="MBBS, MD, etc." value={qualification} onChange={(e) => setQualification(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><FileCheck className="h-3.5 w-3.5" /> License Number *</Label>
                    <Input placeholder="MCI/State Medical Council Number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Experience (years)</Label>
                      <Input type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> Consultation Fee</Label>
                      <Input type="number" min={0} value={consultationFee} onChange={(e) => setConsultationFee(Number(e.target.value))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> Hospital / Clinic</Label>
                    <Input placeholder="City Hospital" value={hospital} onChange={(e) => setHospital(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea placeholder="Brief description of your practice..." rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Upload className="h-3.5 w-3.5" /> Medical License *</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                      className="file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary"
                    />
                    {licenseFile && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileCheck className="h-3 w-3 text-primary" /> {licenseFile.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Upload className="h-3.5 w-3.5" /> Degree Certificate *</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                      className="file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary"
                    />
                    {certificateFile && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileCheck className="h-3 w-3 text-primary" /> {certificateFile.name}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Stethoscope className="mr-2 h-4 w-4" />}
                    Submit Registration
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to role selection
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
