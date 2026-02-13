import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, AlertCircle, ChevronRight, Trash2, RefreshCw, Calendar, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMedicalReports, MedicalReport } from "@/hooks/useMedicalReports";
import ReportDetail from "@/components/records/ReportDetail";
import TrendChart from "@/components/records/TrendChart";

const reportTypes = [
  { value: "lab", label: "Lab / Blood Test", icon: "🧪", shortLabel: "Lab" },
  { value: "imaging", label: "Imaging (X-ray, MRI, CT)", icon: "📷", shortLabel: "Imaging" },
  { value: "prescription", label: "Prescription", icon: "💊", shortLabel: "Rx" },
  { value: "discharge", label: "Discharge Summary", icon: "🏥", shortLabel: "Discharge" },
  { value: "other", label: "Other", icon: "📄", shortLabel: "Other" },
];

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

export default function Records() {
  const { reports, isLoading, uploadAndAnalyze, deleteReport, retryAnalysis } = useMedicalReports();
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: "",
    reportType: "lab",
    reportDate: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB allowed.", variant: "destructive" });
      return;
    }

    setUploadForm((prev) => ({ ...prev, file, title: prev.title || file.name.replace(/\.[^.]+$/, "") }));

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }

    setShowUpload(false);
    toast({ title: "Uploading...", description: "Your report is being uploaded and analyzed by AI." });

    await uploadAndAnalyze.mutateAsync({
      file: uploadForm.file,
      reportType: uploadForm.reportType,
      title: uploadForm.title,
      reportDate: uploadForm.reportDate,
    });

    setUploadForm({ file: null, title: "", reportType: "lab", reportDate: "" });
    setPreview(null);

    toast({ title: "Analysis Complete!", description: "Your report has been processed by AI." });
  };

  const completedReports = reports.filter((r) => r.status === "completed" && r.extracted_data?.test_results?.length > 0);
  const hasTestData = completedReports.length > 0;

  // Category filtering
  const filteredReports = activeCategory === "all"
    ? reports
    : reports.filter((r) => r.report_type === activeCategory);

  const categoryCounts = reportTypes.reduce<Record<string, number>>((acc, rt) => {
    acc[rt.value] = reports.filter((r) => r.report_type === rt.value).length;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (selectedReport) {
    return <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }


  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">Reports & Records</h2>
        <div className="flex gap-2">
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs sm:text-sm">
                <Upload className="h-3.5 w-3.5" /> Upload Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Upload Medical Report
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* File picker */}
                <div
                  className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                  ) : uploadForm.file ? (
                    <div className="flex items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-foreground truncate max-w-[200px]">{uploadForm.file.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Tap to select a photo or PDF</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Max 10MB</p>
                    </>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Report Type</Label>
                  <Select value={uploadForm.reportType} onValueChange={(v) => setUploadForm((p) => ({ ...p, reportType: v }))}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((rt) => (
                        <SelectItem key={rt.value} value={rt.value}>
                          {rt.icon} {rt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input
                    className="h-10 text-sm"
                    placeholder="e.g. CBC Blood Test"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Report Date (optional)</Label>
                  <Input
                    className="h-10 text-sm"
                    type="date"
                    value={uploadForm.reportDate}
                    onChange={(e) => setUploadForm((p) => ({ ...p, reportDate: e.target.value }))}
                  />
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleUpload}
                  disabled={!uploadForm.file || uploadAndAnalyze.isPending}
                >
                  {uploadAndAnalyze.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" /> Upload & Analyze with AI
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category filter pills */}
      {reports.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            📋 All
            <span className="text-[10px] opacity-70">{reports.length}</span>
          </button>
          {reportTypes.map((rt) => {
            const count = categoryCounts[rt.value] || 0;
            if (count === 0) return null;
            return (
              <button
                key={rt.value}
                onClick={() => setActiveCategory(rt.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === rt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {rt.icon} {rt.shortLabel}
                <span className="text-[10px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reports list */}
      {reports.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">No Reports Yet</h3>
            <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground">
              Upload your medical reports and our AI will extract key data, generate summaries, and track trends over time.
            </p>
            <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowUpload(true)}>
              <Upload className="h-3.5 w-3.5" /> Upload First Report
            </Button>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No reports in this category yet.</p>
            <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => setShowUpload(true)}>
              <Upload className="h-3.5 w-3.5" /> Upload {reportTypes.find(rt => rt.value === activeCategory)?.label || "Report"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onView={() => setSelectedReport(report)}
              onDelete={() => deleteReport.mutate(report.id)}
              onRetry={() => retryAnalysis.mutate({ reportId: report.id, reportType: report.report_type })}
              isRetrying={retryAnalysis.isPending}
            />
          ))}
        </div>
      )}

      {/* Inline Trend Chart */}
      {hasTestData && (
        <div className="pt-2">
          <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            📊 Health Trends
            <span className="text-[10px] font-normal text-muted-foreground">
              {completedReports.length === 1
                ? "Upload more reports to see trends over time"
                : `Tracking across ${completedReports.length} reports`}
            </span>
          </h3>
          <TrendChart reports={completedReports} />
        </div>
      )}
    </motion.div>
  );
}

function ReportCard({
  report,
  onView,
  onDelete,
  onRetry,
  isRetrying,
}: {
  report: MedicalReport;
  onView: () => void;
  onDelete: () => void;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  const typeInfo = reportTypes.find((t) => t.value === report.report_type);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 text-2xl">{typeInfo?.icon || "📄"}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-medium text-sm truncate text-foreground">{report.title}</h4>
              <Badge variant="outline" className={`text-[9px] flex-shrink-0 ${statusColors[report.status]}`}>
                {report.status === "processing" && <Loader2 className="h-2.5 w-2.5 animate-spin mr-0.5" />}
                {report.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <span>{typeInfo?.label}</span>
              {report.report_date && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.report_date).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
            {report.ai_summary && (
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                {report.ai_summary}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {report.status === "failed" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry();
                }}
                disabled={isRetrying}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
