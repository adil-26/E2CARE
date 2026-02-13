import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMedicalHistory } from "@/hooks/useMedicalHistory";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateMedicalHistoryPdf } from "@/utils/generateMedicalHistoryPdf";
import StepNavigation from "@/components/medical-history/StepNavigation";
import StepBirthHistory from "@/components/medical-history/StepBirthHistory";
import StepChildhoodIllnesses from "@/components/medical-history/StepChildhoodIllnesses";
import StepMedicalConditions from "@/components/medical-history/StepMedicalConditions";
import StepFamilyHistory from "@/components/medical-history/StepFamilyHistory";
import StepGenderHealth from "@/components/medical-history/StepGenderHealth";
import StepSurgeries from "@/components/medical-history/StepSurgeries";
import StepAllergies from "@/components/medical-history/StepAllergies";
import StepBodySystems from "@/components/medical-history/StepBodySystems";
import StepLifestyle from "@/components/medical-history/StepLifestyle";
import CompletionCelebration from "@/components/medical-history/CompletionCelebration";

const STEPS = [
  { key: "birth_history", label: "Birth History", icon: "🍼" },
  { key: "childhood_illnesses", label: "Childhood Illnesses", icon: "🧒" },
  { key: "medical_conditions", label: "Medical Conditions", icon: "📋" },
  { key: "family_history", label: "Family History", icon: "👨‍👩‍👧‍👦" },
  { key: "gender_health", label: "Gender Health", icon: "⚕️" },
  { key: "surgeries", label: "Surgeries", icon: "🏥" },
  { key: "allergies", label: "Allergies", icon: "🤧" },
  { key: "body_systems", label: "Body Systems", icon: "🫀" },
  { key: "lifestyle", label: "Lifestyle", icon: "🏃" },
] as const;

export default function MedicalHistory() {
  const { history, isLoading, saveStep, completionPercent } = useMedicalHistory();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [localData, setLocalData] = useState<Record<string, Record<string, any>>>({});
  const [gender, setGender] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!isLoading && history && !hasInitialized) {
      const initialData: Record<string, Record<string, any>> = {};
      STEPS.forEach(({ key }) => {
        initialData[key] = (history as any)[key] || {};
      });
      setLocalData(initialData);
      setCurrentStep(Math.min((history.current_step || 1) - 1, STEPS.length - 1));
      setHasInitialized(true);
    }
  }, [isLoading, history, hasInitialized]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("gender, full_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setGender(data?.gender ?? null);
        setPatientName(data?.full_name ?? "");
      });
  }, [user]);

  const stepKey = STEPS[currentStep].key;

  const updateStepData = (data: Record<string, any>) => {
    setLocalData((prev) => ({ ...prev, [stepKey]: data }));
  };

  const handleSave = async () => {
    await saveStep.mutateAsync({
      [stepKey]: localData[stepKey],
      current_step: currentStep + 1,
      is_complete: currentStep === STEPS.length - 1,
    });
    toast({ title: "Saved!", description: `${STEPS[currentStep].label} saved successfully.` });
  };

  const handleNext = async () => {
    const isLastStep = currentStep === STEPS.length - 1;
    const nextStep = currentStep + 1;
    await saveStep.mutateAsync({
      [stepKey]: localData[stepKey],
      current_step: Math.min(nextStep + 1, STEPS.length),
      is_complete: isLastStep,
    });
    toast({ title: "Saved!", description: `${STEPS[currentStep].label} saved successfully.` });
    if (isLastStep) {
      setShowCelebration(true);
    } else {
      setCurrentStep(nextStep);
    }
  };

  const handleCloseCelebration = useCallback(() => setShowCelebration(false), []);

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const renderStep = () => {
    const data = localData[stepKey] || {};
    switch (stepKey) {
      case "birth_history":
        return <StepBirthHistory data={data} onChange={updateStepData} />;
      case "childhood_illnesses":
        return <StepChildhoodIllnesses data={data} onChange={updateStepData} />;
      case "medical_conditions":
        return <StepMedicalConditions data={data} onChange={updateStepData} />;
      case "family_history":
        return <StepFamilyHistory data={data} onChange={updateStepData} />;
      case "gender_health":
        return <StepGenderHealth data={data} onChange={updateStepData} gender={gender} />;
      case "surgeries":
        return <StepSurgeries data={data} onChange={updateStepData} />;
      case "allergies":
        return <StepAllergies data={data} onChange={updateStepData} />;
      case "body_systems":
        return <StepBodySystems data={data} onChange={updateStepData} />;
      case "lifestyle":
        return <StepLifestyle data={data} onChange={updateStepData} />;
      default:
        return null;
    }
  };

  return (
    <>
      <CompletionCelebration show={showCelebration} onClose={handleCloseCelebration} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 sm:space-y-4 overflow-x-hidden">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">Medical History</h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={async () => await generateMedicalHistoryPdf(history as any, patientName)}
            disabled={completionPercent === 0}
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
        </div>

        {/* Mobile nav on top */}
        <div className="md:hidden">
          <StepNavigation
            steps={STEPS}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            filledSteps={localData}
            completionPercent={completionPercent}
          />
        </div>

        {/* Desktop: sidebar + content layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop sidebar stepper */}
          <div className="hidden md:block md:w-56 lg:w-64 flex-shrink-0">
            <StepNavigation
              steps={STEPS}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              filledSteps={localData}
              completionPercent={completionPercent}
            />
          </div>

          {/* Step content */}
          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
            <Card className="shadow-sm border-border/60">
              <CardContent className="p-3.5 sm:p-5 md:p-6">
                {/* Step header */}
                <div className="mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">{STEPS[currentStep].icon}</span>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-semibold text-foreground leading-tight">
                      {STEPS[currentStep].label}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      Step {currentStep + 1} of {STEPS.length}
                    </p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={stepKey}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Navigation buttons — extra bottom margin on mobile to clear bottom nav */}
            <div className="flex items-center justify-between pb-2 sm:pb-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-1 text-xs sm:text-sm"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={saveStep.isPending}
                className="gap-1 text-xs sm:text-sm"
              >
                <Save className="h-4 w-4" /> Save
              </Button>

              <Button
                size="sm"
                onClick={handleNext}
                disabled={saveStep.isPending}
                className="gap-1 text-xs sm:text-sm"
              >
                {currentStep === STEPS.length - 1 ? "Done" : "Next"} <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
