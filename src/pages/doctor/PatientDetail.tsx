import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Heart, Droplets, Activity, Pill, FileText, Stethoscope,
  TrendingUp, Thermometer, Wind, Plus, Brain, LayoutGrid, BarChart3, ExternalLink,
  Download, Loader2, Clock, Calendar, CheckCircle2, ChevronRight, Share2, MessageSquare, AlertCircle, AlertTriangle, Leaf
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatientFullData } from "@/hooks/useDoctorPatients";
import PatientMedicalHistory from "@/components/doctor/PatientMedicalHistory";
import ReportDetail from "@/components/records/ReportDetail";
import { MedicineAdherenceDashboard } from "@/components/doctor/MedicineAdherenceDashboard";
import { ClinicalAlertsWidget } from "@/components/doctor/ClinicalAlertsWidget";
import { ClinicalTrendsGraph } from "@/components/doctor/ClinicalTrendsGraph";
import { AyurvedicCaseTab } from "@/components/ayurveda/AyurvedicCaseTab";
import TrendChart from "@/components/records/TrendChart";
import ComparisonTable from "@/components/records/ComparisonTable";
import { downloadComparisonReport } from "@/utils/reportExportUtils";
import { format } from "date-fns";
import { MedicalReport } from "@/hooks/useMedicalReports";
import { IdCardDialog } from "@/components/patient/IdCardDialog";
export default function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patientData, isLoading } = usePatientFullData(patientId);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [analysisView, setAnalysisView] = useState<"trends" | "comparison" | "overlays">("trends");
  const [isExporting, setIsExporting] = useState(false);  if (isLoading) {
    return <div className="flex items-center justify-center py-16 text-muted-foreground">Loading patient data...</div>;
  }

  if (!patientData?.profile) {
    return <div className="py-16 text-center text-muted-foreground">Patient not found</div>;
  }

  const { profile, vitals, medications, reports, conditionLogs, medicalHistory, treatmentPlans } = patientData;
  const initials = (profile.full_name || "P").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const completedReports = reports.filter((r: any) => r.status === "completed") as MedicalReport[];
  const hasTestData = completedReports.some(r => r.extracted_data?.test_results?.length > 0);
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
          <div className="flex items-center gap-2">
            <IdCardDialog patient={profile} patientId={patientId || ''} />
            <Button variant="outline" onClick={() => navigate(`/doctor/treatment-plan/new?patient=${patientId}`)}>
              <Plus className="mr-1 h-4 w-4" /> Build Plan
            </Button>
            <Button onClick={() => navigate(`/doctor/prescriptions/new?patient=${patientId}`)}>
              <Plus className="mr-1 h-4 w-4" /> Prescribe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prominent Clinical Alerts display */}
      <ClinicalAlertsWidget patientId={patientId || ""} />

      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-8 mb-8 overflow-x-auto scrollbar-none">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="medications">Meds</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="conditions">Log</TabsTrigger>
          <TabsTrigger value="ayurveda">Ayurveda</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
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
        <TabsContent value="medications" className="space-y-4 pt-3">
          <div className="mb-6">
            <MedicineAdherenceDashboard patientId={patientId || ""} />
          </div>
          
          <h3 className="text-sm font-semibold mb-2">Active Prescriptions</h3>
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

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4 pt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Holistic Treatment Plans</h3>
            <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/treatment-plan/new?patient=${patientId}`)}>
              <Plus className="mr-1 h-3 w-3" /> New Plan
            </Button>
          </div>
          {(!treatmentPlans || treatmentPlans.length === 0) ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No holistic treatment plans created yet.</p>
          ) : (
            treatmentPlans.map((plan: any) => (
              <Card key={plan.id} className="shadow-sm border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base text-primary flex items-center gap-2">
                        <Activity className="w-4 h-4" /> {plan.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Active Period: {plan.start_date} to {plan.end_date}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.description && <p className="text-sm text-foreground">{plan.description}</p>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Herbs */}
                    {plan.ayurvedic_herbs?.length > 0 && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-emerald-600 tracking-wider flex items-center gap-1"><Leaf className="w-3 h-3"/> Herbs</label>
                        <ul className="text-sm space-y-1 pl-4 list-disc text-muted-foreground">
                          {plan.ayurvedic_herbs.map((h: string, i: number) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {/* Lifestyle */}
                    {plan.lifestyle_changes?.length > 0 && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-blue-600 tracking-wider">Lifestyle</label>
                        <ul className="text-sm space-y-1 pl-4 list-disc text-muted-foreground">
                          {plan.lifestyle_changes.map((l: string, i: number) => <li key={i}>{l}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Diet */}
                    {(plan.diet_instructions?.include?.length > 0 || plan.diet_instructions?.avoid?.length > 0) && (
                      <div className="space-y-1 md:col-span-2 bg-muted/40 p-3 rounded-lg mt-2">
                         <label className="text-xs font-semibold uppercase text-amber-600 tracking-wider block mb-2">Dietary Protocol</label>
                         <div className="grid grid-cols-2 gap-2 text-sm">
                           <div>
                             <span className="text-green-600 flex items-center gap-1 font-medium"><CheckCircle2 className="w-3 h-3"/> Include</span>
                             <ul className="pl-4 list-disc text-muted-foreground mt-1">
                               {plan.diet_instructions.include?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                             </ul>
                           </div>
                           <div>
                             <span className="text-destructive flex items-center gap-1 font-medium"><AlertTriangle className="w-3 h-3"/> Avoid</span>
                             <ul className="pl-4 list-disc text-muted-foreground mt-1">
                               {plan.diet_instructions.avoid?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                             </ul>
                           </div>
                         </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-2 pt-3">
          {selectedReportId ? (
            <div className="bg-card rounded-xl border border-border p-1">
              <ReportDetail 
                report={reports.find((r: any) => r.id === selectedReportId) as MedicalReport} 
                onBack={() => setSelectedReportId(null)} 
              />
            </div>
          ) : (
            <>
              {reports.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No reports uploaded</p>
              ) : (
                reports.map((r: any) => (
                  <Card 
                    key={r.id} 
                    className="shadow-sm hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedReportId(r.id)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                        <FileText className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.report_type} • {r.report_date || "No date"}</p>
                        {r.ai_summary && <p className="mt-1 text-xs text-muted-foreground line-clamp-1 italic">"{r.ai_summary.substring(0, 100)}..."</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="text-[10px]">{r.status}</Badge>
                        {r.file_url && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(r.file_url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Health Analysis</h3>
              <p className="text-[10px] text-muted-foreground">Comprehensive trends and comparisons across all records</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-[10px] sm:text-xs"
                onClick={async () => {
                  setIsExporting(true);
                  try { await downloadComparisonReport(completedReports); }
                  catch (e) {}
                  finally { setIsExporting(false); }
                }}
                disabled={!hasTestData || isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Export Analysis</span>
                <span className="sm:hidden">Export</span>
              </Button>

              <div className="flex bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setAnalysisView("trends")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    analysisView === "trends" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />
                  Trends
                </button>
                <button
                  onClick={() => setAnalysisView("comparison")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    analysisView === "comparison" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <LayoutGrid className="h-3 w-3" />
                  Comparison
                </button>
                <button
                  onClick={() => setAnalysisView("overlays")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    analysisView === "overlays" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Activity className="h-3 w-3" />
                  Overlays
                </button>
              </div>
            </div>
          </div>

          {analysisView === "trends" ? (
            <TrendChart reports={completedReports} />
          ) : analysisView === "comparison" ? (
            <ComparisonTable reports={completedReports} />
          ) : (
            <ClinicalTrendsGraph vitals={vitals} medications={medications} />
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

        {/* Ayurveda Tab */}
        <TabsContent value="ayurveda" className="pt-3">
          {/* Note: In a real app doctorId is dynamic from auth but we hardcode 'doctor' for now */}
          <AyurvedicCaseTab patientId={patientId || ''} doctorId="doctor-mock-id" />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
