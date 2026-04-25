import { motion } from "framer-motion";
import { ChevronLeft, Calendar, FileText, AlertTriangle, CheckCircle2, Download, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MedicalReport, useMedicalReports } from "@/hooks/useMedicalReports";
import { generateReportPdf } from "@/utils/generateReportPdf";
import { useRole } from "@/hooks/useRole";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Stethoscope } from "lucide-react";

interface ReportDetailProps {
  report: MedicalReport;
  onBack: () => void;
}

const statusIcons: Record<string, string> = {
  normal: "✅",
  high: "🔺",
  low: "🔻",
  critical: "🚨",
  unknown: "❓",
};

const statusBadgeClasses: Record<string, string> = {
  normal: "bg-[#4ab896] hover:bg-[#4ab896] text-white border-transparent",
  high: "bg-[#e53e3e] hover:bg-[#e53e3e] text-white border-transparent",
  low: "bg-[#3182ce] hover:bg-[#3182ce] text-white border-transparent",
  attention: "bg-[#e53e3e] hover:bg-[#e53e3e] text-white border-transparent",
  critical: "bg-[#e53e3e] hover:bg-[#e53e3e] text-white border-transparent",
  unknown: "bg-muted text-muted-foreground",
};

export default function ReportDetail({ report, onBack }: ReportDetailProps) {
  const { role } = useRole();
  const { updateReportReview, deleteReport } = useMedicalReports();
  
  const [reviewStatus, setReviewStatus] = useState<'pending'|'reviewed'|'requires_action'>(report.review_status || 'pending');
  const [doctorNotes, setDoctorNotes] = useState(report.doctor_notes || '');

  const data = report.extracted_data || {};
  const testResults = data.test_results || [];
  const medications = data.medications || [];
  const findings = data.findings || [];

  // Group tests by category
  const groupedTests = testResults.reduce((acc: Record<string, any[]>, test: any) => {
    const cat = test.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(test);
    return acc;
  }, {});

  const abnormalCount = testResults.filter(
    (t: any) => t.status === "high" || t.status === "low" || t.status === "critical"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 overflow-x-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-xs px-2 shrink-0">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
            disabled={deleteReport.isPending}
            onClick={() => {
               if(window.confirm("Are you sure you want to permanently delete this report and its document?")) {
                 deleteReport.mutate(report.id, { onSuccess: () => onBack() });
               }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> {deleteReport.isPending ? "Deleting..." : "Delete"}
          </Button>

          {report.file_url && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 bg-white"
              onClick={() => window.open(report.file_url, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Original
            </Button>
          )}
          {report.status === "completed" && (
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
              onClick={async () => await generateReportPdf(report)}
            >
              <Download className="h-3.5 w-3.5" /> AI Report
            </Button>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">{report.title}</h2>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          {report.report_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(report.report_date).toLocaleDateString()}
            </span>
          )}
          {data.lab_name && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {data.lab_name}
            </span>
          )}
        </div>
      </div>

      {/* AI Summary */}
      {report.ai_summary && (
        <Card className="shadow-sm border-primary/20 bg-primary/5">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg mt-0.5">🤖</span>
              <div className="min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-1">AI Summary</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {report.ai_summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick stats */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{testResults.length}</p>
              <p className="text-[10px] text-muted-foreground">Tests Found</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {testResults.length - abnormalCount}
              </p>
              <p className="text-[10px] text-muted-foreground">Normal</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${abnormalCount > 0 ? "text-red-600" : "text-green-600"}`}>
                {abnormalCount}
              </p>
              <p className="text-[10px] text-muted-foreground">Abnormal</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results by Category */}
      {Object.entries(groupedTests).map(([category, tests]) => (
        <div key={category} className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">{category}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(tests as any[]).map((test: any, i: number) => (
              <Card key={i} className="shadow-sm hover:shadow transition-shadow">
                <CardContent className="p-4 sm:p-5 flex flex-col h-full">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {test.test_name}
                  </span>
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-2xl font-bold text-foreground">
                      {test.value}
                    </span>
                    {test.unit && (
                      <span className="text-[13px] font-medium text-muted-foreground">
                        {test.unit}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex justify-between items-end gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border-0 capitalize ${statusBadgeClasses[test.status?.toLowerCase()] || statusBadgeClasses.unknown}`}
                    >
                      {test.status}
                    </Badge>
                    {test.reference_range && (
                      <span className="text-[9px] text-muted-foreground/70 text-right leading-tight max-w-[50%]">
                        Ref: {test.reference_range}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Medications */}
      {medications.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <h4 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-1.5">
              💊 Medications ({medications.length})
            </h4>
            <div className="space-y-2">
              {medications.map((med: any, i: number) => (
                <div key={i} className="rounded-lg border border-border p-2.5">
                  <p className="font-medium text-sm text-foreground">{med.name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-muted-foreground">
                    {med.dosage && <span>💊 {med.dosage}</span>}
                    {med.frequency && <span>🔄 {med.frequency}</span>}
                    {med.duration && <span>📅 {med.duration}</span>}
                    {med.instructions && <span>📝 {med.instructions}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Findings */}
      {findings.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <h4 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-1.5">
              🔍 Key Findings
            </h4>
            <ul className="space-y-1.5">
              {findings.map((finding: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                  <span className="mt-0.5 text-primary">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* No data message */}
      {testResults.length === 0 && medications.length === 0 && findings.length === 0 && report.status === "completed" && (
        <Card className="shadow-sm">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No structured data was extracted. The report may be in an unsupported format.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Doctor Review Panel (Only visible to Doctors/Admins) */}
      {(role === 'doctor' || role === 'admin') && (
        <Card className="mt-6 border-primary/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80"></div>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Doctor Annotation & Review
            </h3>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="space-y-1 w-full sm:w-1/3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                  <Select value={reviewStatus} onValueChange={(val: any) => setReviewStatus(val)}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="reviewed">Reviewed (Normal)</SelectItem>
                      <SelectItem value="requires_action">Requires Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full flex-1 pt-0 sm:pt-4">
                  <Button 
                    className="w-full sm:w-auto mt-1 sm:mt-0 px-8" 
                    disabled={updateReportReview.isPending}
                    onClick={() => updateReportReview.mutate({ id: report.id, reviewStatus, doctorNotes })}
                  >
                    {updateReportReview.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Save Review
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clinical Notes (Visible to Patient)</label>
                <Textarea 
                  placeholder="Review notes, follow-up instructions, or interpretations..." 
                  className="resize-y min-h-[100px] text-sm"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom padding for mobile nav */}
      <div className="pb-4" />
    </motion.div>
  );
}
