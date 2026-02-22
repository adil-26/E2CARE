import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";

interface StepFamilyHistoryProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const conditionIds = [
  "diabetes1", "diabetes2", "hypertension",
  "heartDisease", "stroke", "cancer", "asthmaCOPD",
  "thyroid", "kidneyDisease", "liverDisease",
  "mentalHealth", "alzheimers",
  "epilepsy", "autoimmune", "bloodDisorders",
  "arthritis", "obesity", "geneticDisorders",
];

const relativeIds = ["father", "mother", "paternalGrandfather", "paternalGrandmother", "maternalGrandfather", "maternalGrandmother", "siblings"];

export default function StepFamilyHistory({ data, onChange }: StepFamilyHistoryProps) {
  const { t } = useLanguage();
  const familyData: Record<string, string[]> = data.conditions_by_relative || {};

  const toggleCondition = (relativeId: string, conditionId: string) => {
    const current = familyData[relativeId] || [];
    const updated = current.includes(conditionId)
      ? current.filter((c) => c !== conditionId)
      : [...current, conditionId];
    onChange({
      ...data,
      conditions_by_relative: { ...familyData, [relativeId]: updated },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {t.familyHistory.description}
      </p>

      {relativeIds.map((id) => {
        const relativeLabel = t.familyHistory[id as keyof typeof t.familyHistory] as string;
        const relativeConditions = familyData[id] || [];
        const hasSelections = relativeConditions.length > 0;
        return (
          <Card key={id} className="shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <Label className="block text-sm font-semibold">
                  {relativeLabel}
                  {hasSelections && (
                    <span className="ml-1.5 text-[10px] font-normal text-primary">
                      ({relativeConditions.length} selected)
                    </span>
                  )}
                </Label>
                <HearOutButton text={relativeLabel} />
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-1.5 overflow-hidden">
                {conditionIds.map((cId) => {
                  const isSelected = relativeConditions.includes(cId);
                  const conditionLabel = t.familyHistory[cId as keyof typeof t.familyHistory] as string;
                  return (
                    <button
                      key={cId}
                      type="button"
                      onClick={() => toggleCondition(id, cId)}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-[11px] sm:text-xs sm:rounded-full sm:px-2.5 sm:py-1 font-medium transition-all text-left break-words min-w-0 leading-tight",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent active:scale-95"
                      )}
                    >
                      {conditionLabel}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">{t.familyHistory.fatherAgeLabel}</Label>
          <Input
            className="h-10"
            placeholder={t.familyHistory.agePlaceholder}
            value={data.father_age || ""}
            onChange={(e) => onChange({ ...data, father_age: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">{t.familyHistory.motherAgeLabel}</Label>
          <Input
            className="h-10"
            placeholder={t.familyHistory.agePlaceholder}
            value={data.mother_age || ""}
            onChange={(e) => onChange({ ...data, mother_age: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">{t.familyHistory.causeOfDeathLabel}</Label>
        <Textarea
          placeholder={t.familyHistory.causeOfDeathPlaceholder}
          value={data.cause_of_death || ""}
          onChange={(e) => onChange({ ...data, cause_of_death: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">{t.familyHistory.consanguinityLabel}</Label>
        <Select value={data.consanguinity || ""} onValueChange={(v) => onChange({ ...data, consanguinity: v })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder={t.common.all + "..."} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no">{t.common.no}</SelectItem>
            <SelectItem value="yes">{t.common.yes}</SelectItem>
            <SelectItem value="unknown">{t.common.unknown}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
