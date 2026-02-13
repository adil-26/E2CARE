import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StepFamilyHistoryProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const conditions = [
  "Diabetes (Type 1)", "Diabetes (Type 2)", "Hypertension",
  "Heart Disease", "Stroke", "Cancer", "Asthma / COPD",
  "Thyroid Disorder", "Kidney Disease", "Liver Disease",
  "Mental Health (Depression/Anxiety)", "Alzheimer's / Dementia",
  "Epilepsy", "Autoimmune Disease", "Blood Disorders",
  "Arthritis", "Obesity", "Genetic Disorders",
];

const relatives = ["Father", "Mother", "Paternal Grandfather", "Paternal Grandmother", "Maternal Grandfather", "Maternal Grandmother", "Siblings"];

export default function StepFamilyHistory({ data, onChange }: StepFamilyHistoryProps) {
  const familyData: Record<string, string[]> = data.conditions_by_relative || {};

  const toggleCondition = (relative: string, condition: string) => {
    const current = familyData[relative] || [];
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    onChange({
      ...data,
      conditions_by_relative: { ...familyData, [relative]: updated },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <p className="text-xs sm:text-sm text-muted-foreground">
        Select any conditions your family members have or had. This is crucial for understanding genetic predispositions.
      </p>

      {relatives.map((relative) => {
        const relativeConditions = familyData[relative] || [];
        const hasSelections = relativeConditions.length > 0;
        return (
          <Card key={relative} className="shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <Label className="mb-2.5 block text-sm font-semibold">
                {relative}
                {hasSelections && (
                  <span className="ml-1.5 text-[10px] font-normal text-primary">
                    ({relativeConditions.length} selected)
                  </span>
                )}
              </Label>
              <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-1.5 overflow-hidden">
                {conditions.map((condition) => {
                  const isSelected = relativeConditions.includes(condition);
                  return (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => toggleCondition(relative, condition)}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-[11px] sm:text-xs sm:rounded-full sm:px-2.5 sm:py-1 font-medium transition-all text-left break-words min-w-0 leading-tight",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent active:scale-95"
                      )}
                    >
                      {condition}
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
          <Label className="text-xs sm:text-sm">Father's Age / Age at Death</Label>
          <Input
            className="h-10"
            placeholder="e.g. 65 (alive) or 70 (deceased)"
            value={data.father_age || ""}
            onChange={(e) => onChange({ ...data, father_age: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">Mother's Age / Age at Death</Label>
          <Input
            className="h-10"
            placeholder="e.g. 60 (alive)"
            value={data.mother_age || ""}
            onChange={(e) => onChange({ ...data, mother_age: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Cause of Death (if any family member deceased)</Label>
        <Textarea
          placeholder="Mention the relative and cause..."
          value={data.cause_of_death || ""}
          onChange={(e) => onChange({ ...data, cause_of_death: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Consanguinity (Are your parents blood relatives?)</Label>
        <Select value={data.consanguinity || ""} onValueChange={(v) => onChange({ ...data, consanguinity: v })}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="unknown">Don't Know</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
