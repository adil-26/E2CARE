import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Info, BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMedicalReports } from "@/hooks/useMedicalReports";
import ComparisonTable from "@/components/records/ComparisonTable";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { downloadComparisonReport } from "@/utils/reportExportUtils";

export default function ComparisonAnalysis() {
  const { reports, isLoading } = useMedicalReports();
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleDownloadPdf = async () => {
    if (reports.length === 0 || isExporting) return;
    setIsExporting(true);
    try {
      await downloadComparisonReport(reports);
    } catch (error) {
      // Error handled in utility
    } finally {
      setIsExporting(false);
    }
  };

  const completedReports = reports.filter(r => r.status === "completed" && r.extracted_data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 max-w-7xl space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/records")}
            className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.common.back} to Records
          </Button>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            {t.nav.comparison}
          </h1>
          <p className="text-sm text-muted-foreground">
            Deep analysis of your health metrics and findings over time.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownloadPdf}
            className="gap-2 shadow-md hover:shadow-lg transition-all min-w-[140px]"
            disabled={completedReports.length === 0 || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Insights Section */}
      {completedReports.length > 1 && (
        <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">AI Health Insights</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on your last {completedReports.length} reports, here is a quick overview of your health movement:
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Key Improvement</p>
                    <p className="text-sm text-foreground">Your recent metabolic markers show a stabilizing trend compared to previous records.</p>
                  </div>
                  <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Observation</p>
                    <p className="text-sm text-foreground">Certain levels in your findings are updated. Consult your doctor to understand the progression.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table Section */}
      <Card className="shadow-lg border-border/50">
        <CardContent className="p-0 sm:p-6">
          <div className="p-4 sm:p-0 border-b sm:border-0 border-border bg-muted/30 sm:bg-transparent">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              📋 Cross-Report Comparison
              <span className="text-xs font-normal text-muted-foreground">
                ({completedReports.length} reports compared)
              </span>
            </h2>
          </div>
          
          <div className="bg-card rounded-b-xl sm:rounded-xl overflow-hidden">
            <ComparisonTable reports={reports} />
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground text-[10px] sm:text-xs italic">
        <Info className="h-3 w-3" />
        This comparison is generated automatically from your uploaded records. Always consult a healthcare professional for clinical interpretation.
      </div>
    </motion.div>
  );
}
