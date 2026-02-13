import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Activity, History } from "lucide-react";

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
        Track your current and past medical conditions. This helps doctors understand your complete health history.
      </p>

      {/* Quick add from common conditions */}
      <div>
        <Label className="mb-2 block text-xs sm:text-sm font-semibold">Quick Add Common Conditions</Label>
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
            placeholder="Or type a condition name..."
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
          />
          <Button type="button" size="sm" onClick={() => quickAdd && addCondition(quickAdd)} disabled={!quickAdd} className="gap-1 h-10 px-3">
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
      </div>

      {/* Active / Chronic Conditions */}
      {activeConditions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            <Label className="text-xs sm:text-sm font-semibold">Current / Active ({activeConditions.length})</Label>
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
            <Label className="text-xs sm:text-sm font-semibold">Past / Resolved ({pastConditions.length})</Label>
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
          <p className="text-xs sm:text-sm text-muted-foreground">No conditions added yet. Use the quick-add buttons above or type a custom condition.</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Additional Notes</Label>
        <Textarea
          placeholder="Any other details about your medical conditions..."
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
  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm flex-shrink-0">{statusIcons[condition.status]}</span>
            <span className="font-medium text-xs sm:text-sm truncate">{condition.name || `Condition ${index + 1}`}</span>
            <Badge variant="outline" className={`text-[9px] sm:text-[10px] flex-shrink-0 ${statusColors[condition.status]}`}>
              {condition.status.toUpperCase()}
            </Badge>
          </div>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0 text-destructive" onClick={() => onRemove(index)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          {!condition.name && (
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-[10px] sm:text-xs">Condition Name</Label>
              <Input className="h-10 text-sm" placeholder="e.g. Diabetes Type 2" value={condition.name} onChange={(e) => onUpdate(index, "name", e.target.value)} />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs">Status</Label>
            <Select value={condition.status} onValueChange={(v) => onUpdate(index, "status", v)}>
              <SelectTrigger className="h-10 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">🔴 Active</SelectItem>
                <SelectItem value="chronic">🟡 Chronic</SelectItem>
                <SelectItem value="recurring">🟠 Recurring</SelectItem>
                <SelectItem value="resolved">🟢 Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs">Severity</Label>
            <Select value={condition.severity} onValueChange={(v) => onUpdate(index, "severity", v)}>
              <SelectTrigger className="h-10 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs">Year Diagnosed</Label>
            <Input className="h-10 text-sm" type="number" placeholder="e.g. 2020" value={condition.diagnosed_year} onChange={(e) => onUpdate(index, "diagnosed_year", e.target.value)} min="1940" max="2030" />
          </div>
          {(condition.status === "resolved") && (
            <div className="space-y-1">
              <Label className="text-[10px] sm:text-xs">Year Resolved</Label>
              <Input className="h-10 text-sm" type="number" placeholder="e.g. 2023" value={condition.resolved_year} onChange={(e) => onUpdate(index, "resolved_year", e.target.value)} min="1940" max="2030" />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs">Treatment</Label>
            <Input className="h-10 text-sm" placeholder="e.g. Metformin 500mg" value={condition.treatment} onChange={(e) => onUpdate(index, "treatment", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs">Treating Doctor</Label>
            <Input className="h-10 text-sm" placeholder="Dr. name" value={condition.doctor} onChange={(e) => onUpdate(index, "doctor", e.target.value)} />
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <Label className="text-[10px] sm:text-xs">Notes</Label>
          <Input className="h-10 text-sm" placeholder="Additional details..." value={condition.notes} onChange={(e) => onUpdate(index, "notes", e.target.value)} />
        </div>
      </CardContent>
    </Card>
  );
}
