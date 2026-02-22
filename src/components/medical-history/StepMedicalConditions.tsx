import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Activity, History, ImagePlus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";

interface Condition {
  name: string;
  status: "active" | "resolved" | "chronic" | "recurring";
  diagnosed_year: string;
  resolved_year: string;
  severity: "mild" | "moderate" | "severe";
  treatment: string;
  doctor: string;
  notes: string;
}

interface StepMedicalConditionsProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const commonConditions = [
  "Diabetes (Type 1)", "Diabetes (Type 2)", "Hypertension", "Asthma",
  "COPD", "Thyroid Disorder", "Heart Disease", "High Cholesterol",
  "Arthritis", "Migraine", "Depression", "Anxiety", "GERD / Acid Reflux",
  "Kidney Disease", "Liver Disease", "Anemia", "Epilepsy",
  "Psoriasis", "Eczema", "Chronic Pain", "Sleep Apnea",
  "Osteoporosis", "Gout", "IBS", "Crohn's Disease",
  "Ulcerative Colitis", "Lupus", "Multiple Sclerosis", "Parkinson's",
];

const emptyCondition: Condition = {
  name: "", status: "active", diagnosed_year: "", resolved_year: "",
  severity: "mild", treatment: "", doctor: "", notes: "",
};

interface Issue {
  image_preview?: string;
  image_name?: string;
  description?: string;
  started_from?: string;
  body_part?: string;
  previous_treatment?: string;
  treatment_start?: string;
  treatment_end?: string;
  treating_doctor?: string;
}

const emptyIssue: Issue = {
  description: "", started_from: "", body_part: "",
  previous_treatment: "", treating_doctor: "",
};

const statusColors: Record<string, string> = {
  active: "bg-red-100 text-red-700 border-red-200",
  chronic: "bg-amber-100 text-amber-700 border-amber-200",
  recurring: "bg-orange-100 text-orange-700 border-orange-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
};

const statusIcons: Record<string, string> = {
  active: "🔴", chronic: "🟡", recurring: "🟠", resolved: "🟢",
};

export default function StepMedicalConditions({ data, onChange }: StepMedicalConditionsProps) {
  const conditions: Condition[] = data.conditions || [];
  const [quickAdd, setQuickAdd] = useState("");
  const { t } = useLanguage();

  // Initialize issues from new array OR fallback to old single object (migration)
  const existingIssues: Issue[] = data.current_issues ||
    (data.current_issue && Object.keys(data.current_issue).length > 0 ? [data.current_issue] : []);

  // If no issues exist, show at least one empty form
  const issues: Issue[] = existingIssues.length > 0 ? existingIssues : [emptyIssue];

  const updateIssues = (newIssues: Issue[]) => {
    onChange({
      ...data,
      current_issues: newIssues,
      // Keep legacy field synced with the first issue for backward compatibility if needed
      current_issue: newIssues[0] || {}
    });
  };

  const addIssue = () => {
    updateIssues([...issues, { ...emptyIssue }]);
  };

  const removeIssue = (index: number) => {
    const newIssues = issues.filter((_, i) => i !== index);
    updateIssues(newIssues.length ? newIssues : [{ ...emptyIssue }]);
  };

  const updateIssue = (index: number, field: keyof Issue, value: string) => {
    const newIssues = [...issues];
    newIssues[index] = { ...newIssues[index], [field]: value };
    updateIssues(newIssues);
  };

  const handleIssueImageSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newIssues = [...issues];
      newIssues[index] = {
        ...newIssues[index],
        image_preview: reader.result as string,
        image_name: file.name
      };
      updateIssues(newIssues);
    };
    reader.readAsDataURL(file);
  };

  const removeIssueImage = (index: number) => {
    const newIssues = [...issues];
    newIssues[index] = { ...newIssues[index], image_preview: "", image_name: "" };
    updateIssues(newIssues);
  };

  const addCondition = (name: string = "") => {
    onChange({ ...data, conditions: [...conditions, { ...emptyCondition, name }] });
    setQuickAdd("");
  };

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, conditions: updated });
  };

  const removeCondition = (index: number) => {
    onChange({ ...data, conditions: conditions.filter((_, i) => i !== index) });
  };

  const activeConditions = conditions.filter(c => c.status === "active" || c.status === "chronic");
  const pastConditions = conditions.filter(c => c.status === "resolved" || c.status === "recurring");

  return (
    <div className="space-y-5 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {t.medicalConditions.description}
      </p>

      {/* Current Health Issues */}
      <div className="space-y-4">
        {issues.map((issue, index) => (
          <Card key={index} className="shadow-sm border-l-4 border-l-blue-400 relative">
            <CardContent className="p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="block text-sm font-semibold">
                    📸 {t.medicalConditions.currentIssueTitle} {issues.length > 1 ? `#${index + 1}` : ""}
                  </Label>
                  <HearOutButton text={t.medicalConditions.currentIssueTitle} />
                </div>
                {issues.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive -mr-2"
                    onClick={() => removeIssue(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">{t.medicalConditions.issueDescription}</p>

              {/* Image upload */}
              <div>
                <input
                  id={`file-upload-${index}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleIssueImageSelect(index, e)}
                />
                {issue.image_preview ? (
                  <div className="relative inline-block">
                    <img src={issue.image_preview} alt="Issue" className="h-32 w-auto rounded-xl object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => removeIssueImage(index)}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                    className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-xs text-muted-foreground hover:border-primary/50 hover:bg-accent/30 transition-colors"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {t.medicalConditions.uploadPhoto}
                  </button>
                )}
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">{t.medicalConditions.describeIssueLabel}</Label>
                  <Textarea
                    placeholder={t.medicalConditions.issuePlaceholder}
                    value={issue.description || ""}
                    onChange={(e) => updateIssue(index, "description", e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t.medicalConditions.startedFromLabel}</Label>
                  <Input
                    className="h-10 text-sm"
                    type="date"
                    value={issue.started_from || ""}
                    onChange={(e) => updateIssue(index, "started_from", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t.medicalConditions.bodyPartLabel}</Label>
                  <Input
                    className="h-10 text-sm"
                    placeholder={t.medicalConditions.bodyPartPlaceholder}
                    value={issue.body_part || ""}
                    onChange={(e) => updateIssue(index, "body_part", e.target.value)}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">{t.medicalConditions.prevTreatmentLabel}</Label>
                  <Textarea
                    placeholder={t.medicalConditions.prevTreatmentPlaceholder}
                    value={issue.previous_treatment || ""}
                    onChange={(e) => updateIssue(index, "previous_treatment", e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t.medicalConditions.treatmentStartLabel}</Label>
                  <Input
                    className="h-10 text-sm"
                    type="date"
                    value={issue.treatment_start || ""}
                    onChange={(e) => updateIssue(index, "treatment_start", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t.medicalConditions.treatmentEndLabel}</Label>
                  <Input
                    className="h-10 text-sm"
                    type="date"
                    value={issue.treatment_end || ""}
                    onChange={(e) => updateIssue(index, "treatment_end", e.target.value)}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">{t.medicalConditions.doctorLabel}</Label>
                  <Input
                    className="h-10 text-sm"
                    placeholder={t.medicalConditions.doctorPlaceholder}
                    value={issue.treating_doctor || ""}
                    onChange={(e) => updateIssue(index, "treating_doctor", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addIssue}
          className="w-full sm:w-auto mt-2"
        >
          <Plus className="h-3 w-3 mr-2" /> {t.medicalConditions.addAnotherIssue}
        </Button>
      </div>

      {/* Quick add from common conditions */}
      <div>
        <Label className="mb-2 block text-xs sm:text-sm font-semibold">{t.medicalConditions.quickAddTitle}</Label>
        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-1.5 overflow-hidden">
          {commonConditions.filter(c => !conditions.find(ec => ec.name === c)).slice(0, 15).map((cond) => (
            <button
              key={cond}
              type="button"
              onClick={() => addCondition(cond)}
              className="rounded-lg sm:rounded-full border border-border px-2 py-2 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary text-left break-words min-w-0 leading-tight active:scale-95"
            >
              + {cond}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            className="h-10 flex-1 min-w-0 text-sm"
            placeholder={t.medicalConditions.customConditionPlaceholder}
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
          />
          <Button type="button" size="sm" onClick={() => quickAdd && addCondition(quickAdd)} disabled={!quickAdd} className="gap-1 h-10 px-3">
            <Plus className="h-3 w-3" /> {t.common.add}
          </Button>
        </div>
      </div>

      {/* Active / Chronic Conditions */}
      {activeConditions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            <Label className="text-xs sm:text-sm font-semibold">{t.medicalConditions.activeTitle} ({activeConditions.length})</Label>
          </div>
          <div className="space-y-3">
            {conditions.map((c, i) => (c.status === "active" || c.status === "chronic") && (
              <ConditionCard key={i} condition={c} index={i} onUpdate={updateCondition} onRemove={removeCondition} />
            ))}
          </div>
        </div>
      )}

      {/* Past / Resolved Conditions */}
      {pastConditions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-green-500" />
            <Label className="text-xs sm:text-sm font-semibold">{t.medicalConditions.pastTitle} ({pastConditions.length})</Label>
          </div>
          <div className="space-y-3">
            {conditions.map((c, i) => (c.status === "resolved" || c.status === "recurring") && (
              <ConditionCard key={i} condition={c} index={i} onUpdate={updateCondition} onRemove={removeCondition} />
            ))}
          </div>
        </div>
      )}

      {conditions.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border p-6 sm:p-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">{t.medicalConditions.noConditions}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">{t.common.notes}</Label>
        <Textarea
          placeholder={t.common.notes + "..."}
          value={data.notes || ""}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}

function ConditionCard({
  condition, index, onUpdate, onRemove,
}: {
  condition: Condition; index: number;
  onUpdate: (i: number, f: keyof Condition, v: string) => void;
  onRemove: (i: number) => void;
}) {
  const { t } = useLanguage();

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm flex-shrink-0">{statusIcons[condition.status]}</span>
            <span className="font-medium text-xs sm:text-sm truncate">{condition.name || `${t.history.medical_conditions} ${index + 1}`}</span>
            <Badge variant="outline" className={`text-[9px] sm:text-[10px] flex-shrink-0 ${statusColors[condition.status]}`}>
              {t.medicalConditions[condition.status as keyof typeof t.medicalConditions].toString().toUpperCase()}
            </Badge>
          </div>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0 text-destructive" onClick={() => onRemove(index)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          {!condition.name && (
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-[10px] sm:text-xs">{t.medicalConditions.conditionName}</Label>
              <Input className="h-10 text-sm" placeholder="e.g. Diabetes Type 2" value={condition.name} onChange={(e) => onUpdate(index, "name", e.target.value)} />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs">{t.medicalConditions.statusLabel}</Label>
            <Select value={condition.status} onValueChange={(v) => onUpdate(index, "status", v)}>
              <SelectTrigger className="h-10 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">🔴 {t.medicalConditions.active}</SelectItem>
                <SelectItem value="chronic">🟡 {t.medicalConditions.chronic}</SelectItem>
                <SelectItem value="recurring">🟠 {t.medicalConditions.recurring}</SelectItem>
                <SelectItem value="resolved">🟢 {t.medicalConditions.resolved}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs">{t.medicalConditions.severityLabel}</Label>
            <Select value={condition.severity} onValueChange={(v) => onUpdate(index, "severity", v)}>
              <SelectTrigger className="h-10 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">{t.medicalConditions.mild}</SelectItem>
                <SelectItem value="moderate">{t.medicalConditions.moderate}</SelectItem>
                <SelectItem value="severe">{t.medicalConditions.severe}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs">{t.medicalConditions.diagnosedYear}</Label>
            <Input className="h-10 text-sm" type="number" placeholder="e.g. 2020" value={condition.diagnosed_year} onChange={(e) => onUpdate(index, "diagnosed_year", e.target.value)} min="1940" max="2030" />
          </div>
          {(condition.status === "resolved") && (
            <div className="space-y-1">
              <Label className="text-[10px] sm:text-xs">{t.medicalConditions.resolvedYear}</Label>
              <Input className="h-10 text-sm" type="number" placeholder="e.g. 2023" value={condition.resolved_year} onChange={(e) => onUpdate(index, "resolved_year", e.target.value)} min="1940" max="2030" />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs">{t.common.type}</Label>
            <Input className="h-10 text-sm" placeholder="e.g. Metformin 500mg" value={condition.treatment} onChange={(e) => onUpdate(index, "treatment", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs">{t.common.doctor}</Label>
            <Input className="h-10 text-sm" placeholder="Dr. name" value={condition.doctor} onChange={(e) => onUpdate(index, "doctor", e.target.value)} />
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <Label className="text-[10px] sm:text-xs">{t.common.notes}</Label>
          <Input className="h-10 text-sm" placeholder="Additional details..." value={condition.notes} onChange={(e) => onUpdate(index, "notes", e.target.value)} />
        </div>
      </CardContent>
    </Card>
  );
}
