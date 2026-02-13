import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Pill, FileText, Activity, Heart, Droplets,
  TrendingUp, Thermometer, Wind, Phone, MapPin, Calendar,
  User, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PatientMedicalHistory from "@/components/doctor/PatientMedicalHistory";
import { format } from "date-fns";

function useAdminPatientData(userId?: string) {
  return useQuery({
    queryKey: ["admin_patient_detail", userId],
    enabled: !!userId,
    queryFn: async () => {
      const uid = userId!;
      const [profileRes, vitalsRes, medsRes, reportsRes, conditionsRes, historyRes, appointmentsRes, referralsRes, walletRes] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
          supabase.from("vitals").select("*").eq("user_id", uid).order("recorded_at", { ascending: false }).limit(50),
          supabase.from("medications").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("medical_reports").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("condition_logs").select("*").eq("user_id", uid).order("recorded_at", { ascending: false }).limit(100),
          supabase.from("medical_history").select("*").eq("user_id", uid).maybeSingle(),
          supabase.from("appointments").select("*").eq("user_id", uid).order("appointment_date", { ascending: false }).limit(20),
          supabase.from("referrals").select("*").eq("referrer_id", uid).order("created_at", { ascending: false }),
          supabase.from("wallet_transactions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(20),
        ]);

      return {
        profile: profileRes.data,
        vitals: vitalsRes.data || [],
        medications: medsRes.data || [],
        reports: reportsRes.data || [],
        conditionLogs: conditionsRes.data || [],
        medicalHistory: historyRes.data,
        appointments: appointmentsRes.data || [],
        referrals: referralsRes.data || [],
        walletTransactions: walletRes.data || [],
      };
    },
  });
}

export default function AdminPatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { data: patientData, isLoading } = useAdminPatientData(patientId);

  if (isLoading) {
    return <div className="flex items-center justify-center py-16 text-muted-foreground">Loading patient data...</div>;
  }

  if (!patientData?.profile) {
    return <div className="py-16 text-center text-muted-foreground">Patient not found</div>;
  }

  const { profile, vitals, medications, reports, conditionLogs, medicalHistory, appointments, referrals, walletTransactions } = patientData;
  const initials = (profile.full_name || "P").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/patients")}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Patients
      </Button>

      {/* Patient Header */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              {profile.profile_photo_url && <AvatarImage src={profile.profile_photo_url} className="object-cover" />}
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-2xl font-bold text-foreground">{profile.full_name || "Unknown"}</h2>
                {profile.medical_id && (
                  <Badge variant="outline" className="font-mono text-xs">
                    <Shield className="mr-1 h-3 w-3" /> ID: {profile.medical_id}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.gender && <Badge variant="secondary" className="capitalize">{profile.gender}</Badge>}
                {profile.blood_group && <Badge variant="outline">🩸 {profile.blood_group}</Badge>}
                {profile.date_of_birth && (
                  <Badge variant="outline">
                    <Calendar className="mr-1 h-3 w-3" />
                    DOB: {format(new Date(profile.date_of_birth), "MMM dd, yyyy")}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {profile.phone}
                  </span>
                )}
                {profile.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {profile.address}
                  </span>
                )}
              </div>
              {(profile.emergency_contact_name || profile.emergency_contact_phone) && (
                <p className="text-xs text-muted-foreground">
                  🚨 Emergency: {profile.emergency_contact_name} {profile.emergency_contact_phone && `(${profile.emergency_contact_phone})`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <Activity className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-foreground">{vitals.length}</p>
            <p className="text-xs text-muted-foreground">Vital Records</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <Pill className="mx-auto mb-1 h-5 w-5 text-warning" />
            <p className="text-2xl font-bold text-foreground">{medications.filter((m: any) => m.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Active Meds</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <FileText className="mx-auto mb-1 h-5 w-5 text-secondary" />
            <p className="text-2xl font-bold text-foreground">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Reports</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <Calendar className="mx-auto mb-1 h-5 w-5 text-accent-foreground" />
            <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
            <p className="text-xs text-muted-foreground">Appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="medications">Meds</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="appointments">Appts</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        {/* Medical History */}
        <TabsContent value="history" className="pt-3">
          <PatientMedicalHistory medicalHistory={medicalHistory} />
        </TabsContent>

        {/* Vitals */}
        <TabsContent value="vitals" className="space-y-3 pt-3">
          {vitals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No vitals recorded</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {vitals.slice(0, 18).map((v: any) => (
                <Card key={v.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">{v.vital_type.replace(/_/g, " ")}</p>
                    <p className="mt-1 text-xl font-bold text-foreground">
                      {v.value} <span className="text-sm font-normal text-muted-foreground">{v.unit}</span>
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <Badge variant={v.status === "normal" ? "secondary" : "destructive"} className="text-[10px]">{v.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(v.recorded_at), "MMM dd")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Medications */}
        <TabsContent value="medications" className="space-y-2 pt-3">
          {medications.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No medications</p>
          ) : (
            medications.map((m: any) => (
              <Card key={m.id} className="shadow-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <Pill className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{m.name} — {m.dosage}</p>
                    <p className="text-xs text-muted-foreground">{m.frequency} • Since {m.start_date}</p>
                    {m.prescribed_by && <p className="text-xs text-muted-foreground">By: {m.prescribed_by}</p>}
                  </div>
                  <Badge variant={m.is_active ? "default" : "secondary"}>
                    {m.is_active ? "Active" : "Stopped"}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-2 pt-3">
          {reports.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No reports uploaded</p>
          ) : (
            reports.map((r: any) => (
              <Card key={r.id} className="shadow-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.report_type} • {r.report_date || "No date"}</p>
                    {r.ai_summary && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.ai_summary}</p>}
                  </div>
                  <Badge variant="secondary">{r.status}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Appointments */}
        <TabsContent value="appointments" className="space-y-2 pt-3">
          {appointments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No appointments</p>
          ) : (
            appointments.map((a: any) => (
              <Card key={a.id} className="shadow-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {format(new Date(a.appointment_date), "MMM dd, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.start_time} — {a.end_time}
                    </p>
                    {a.reason && <p className="text-xs text-muted-foreground">{a.reason}</p>}
                  </div>
                  <Badge variant={a.status === "completed" ? "default" : a.status === "cancelled" ? "destructive" : "secondary"}>
                    {a.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Referrals */}
        <TabsContent value="referrals" className="space-y-2 pt-3">
          <div className="mb-3 flex items-center gap-4">
            <Badge variant="outline" className="font-mono">Code: {profile.referral_code || "N/A"}</Badge>
          </div>
          {referrals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No referrals sent</p>
          ) : (
            referrals.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.referred_email}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM dd, yyyy")}</p>
                </div>
                <Badge variant={r.status === "completed" ? "default" : "secondary"}>{r.status}</Badge>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
