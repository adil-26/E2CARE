import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMedicalHistory } from "@/hooks/useMedicalHistory";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProfileCompletionMeter() {
  const navigate = useNavigate();
  const { completionPercent, history } = useMedicalHistory();
  const { t } = useLanguage();

  if (history?.is_complete) return null;

  const getColor = () => {
    if (completionPercent >= 80) return "text-success";
    if (completionPercent >= 40) return "text-warning";
    return "text-primary";
  };

  const currentStep = Math.round(completionPercent / (100 / 7));

  return (
    <Card className="shadow-sm border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">{t.profileCompletion.title}</p>
              <span className={`text-xs font-bold ${getColor()}`}>{completionPercent}%</span>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            >
              <Progress value={completionPercent} className="h-2" />
            </motion.div>
            <p className="mt-1 text-xs text-muted-foreground">
              {completionPercent === 0
                ? t.profileCompletion.startHistory
                : t.profileCompletion.stepsCompleted.replace("{completed}", currentStep.toString()).replace("{total}", "7")}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="flex-shrink-0"
            onClick={() => navigate("/medical-history")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
