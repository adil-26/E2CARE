import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Heart, Droplets, Activity, Pill, FileText, Stethoscope,
  TrendingUp, Thermometer, Wind, Plus, Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatientFullData } from "@/hooks/useDoctorPatients";
import PatientMedicalHistory from "@/components/doctor/PatientMedicalHistory";
import { format } from "date-fns";

export default function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patientData, isLoading } = usePatientFullData(patientId);

  if (isLoading) {
    return <div className="flex items-center justify-center py-16 text-muted-foreground">Loading patient data...</div>;
  }

  if (!patientData?.profile) {
    return <div className="py-16 text-center text-muted-foreground">Patient not found</div>;
  }

  const { profile, vitals, medications, reports, conditionLogs, medicalHistory } = patientData;
  const initials = (profile.full_name || "P").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/doctor/patients")}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Patients
      </Button>

      {/* Patient Header */}
      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-foreground">{profile.full_name}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.gender && <Badge variant="secondary" className="capitalize">{profile.gender}</Badge>}
              {profile.blood_group && <Badge variant="outline">Blood: {profile.blood_group}</Badge>}
              {profile.date_of_birth && <Badge variant="outline">DOB: {profile.date_of_birth}</Badge>}
            </div>
            {profile.phone && <p className="mt-1 text-sm text-muted-foreground">📞 {profile.phone}</p>}
          </div>
          <Button onClick={() => navigate(`/doctor/prescriptions/new?patient=${patientId}`)}>
            <Plus className="mr-1 h-4 w-4" /> Prescribe
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="medications">Meds</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
        </TabsList>

        {/* Medical History Tab */}
        <TabsContent value="history" className="pt-3">
          <PatientMedicalHistory medicalHistory={medicalHistory} />
        </TabsContent>

        {/* Vitals Tab */}
        <TabsContent value="vitals" className="space-y-3 pt-3">
          {vitals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No vitals recorded</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {vitals.slice(0, 12).map((v: any) => (
                <Card key={v.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">{v.vital_type.replace(/_/g, " ")}</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{v.value} <span className="text-sm font-normal text-muted-foreground">{v.unit}</span></p>
                    <Badge variant={v.status === "normal" ? "secondary" : "destructive"} className="mt-1 text-[10px]">{v.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Medications Tab */}
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
                  </div>
                  <Badge variant={m.is_active ? "default" : "secondary"}>
                    {m.is_active ? "Active" : "Stopped"}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Reports Tab */}
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

        {/* Conditions Tab */}
        <TabsContent value="conditions" className="space-y-2 pt-3">
          {conditionLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No condition logs</p>
          ) : (
            conditionLogs.slice(0, 20).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <span className="text-sm font-medium capitalize text-foreground">{c.condition_type.replace(/_/g, " ")}</span>
                  <span className="ml-2 text-sm text-foreground">{Number(c.value)} {c.unit}</span>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(c.recorded_at), "MMM dd, HH:mm")}</span>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
