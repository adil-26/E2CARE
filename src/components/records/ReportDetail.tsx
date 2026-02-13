import { motion } from "framer-motion";
import { ChevronLeft, Calendar, FileText, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MedicalReport } from "@/hooks/useMedicalReports";
import { generateReportPdf } from "@/utils/generateReportPdf";

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
  normal: "bg-green-100 text-green-700 border-green-200",
  high: "bg-red-100 text-red-700 border-red-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
  critical: "bg-red-200 text-red-800 border-red-300",
  unknown: "bg-muted text-muted-foreground",
};

export default function ReportDetail({ report, onBack }: ReportDetailProps) {
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
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-xs">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {report.status === "completed" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={async () => await generateReportPdf(report)}
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
        )}
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
        <Card key={category} className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <h4 className="font-semibold text-sm mb-3 text-foreground">{category}</h4>
            <div className="space-y-2">
              {(tests as any[]).map((test: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 py-1.5 border-b border-border/40 last:border-0"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-xs">{statusIcons[test.status] || "❓"}</span>
                    <span className="text-xs sm:text-sm text-foreground truncate">{test.test_name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-semibold text-xs sm:text-sm text-foreground">
                      {test.value}
                      {test.unit && <span className="font-normal text-muted-foreground ml-0.5">{test.unit}</span>}
                    </span>
                    <Badge variant="outline" className={`text-[8px] sm:text-[9px] ${statusBadgeClasses[test.status]}`}>
                      {test.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {(tests as any[]).some((t: any) => t.reference_range) && (
              <div className="mt-2 pt-2 border-t border-border/40">
                <p className="text-[10px] text-muted-foreground font-medium mb-1">Reference Ranges</p>
                <div className="space-y-0.5">
                  {(tests as any[])
                    .filter((t: any) => t.reference_range)
                    .map((t: any, i: number) => (
                      <p key={i} className="text-[10px] text-muted-foreground">
                        {t.test_name}: {t.reference_range}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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

      {/* Bottom padding for mobile nav */}
      <div className="pb-4" />
    </motion.div>
  );
}
