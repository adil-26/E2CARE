import { useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { VitalInsert } from "@/hooks/useVitals";
import { classifyVital, vitalNormalRange, vitalTrend } from "@/lib/vitalRanges";
import { formatDistanceToNow } from "date-fns";


// ── Validation boundaries per vital type ──
const vitalBounds: Record<string, { validate: (v: string) => string | null; hint: string }> = {
  blood_pressure: {
    hint: "Format: systolic/diastolic (e.g. 120/80). Systolic 70–250, Diastolic 40–150.",
    validate: (v) => {
      const match = v.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (!match) return "Use format: 120/80";
      const sys = parseInt(match[1]), dia = parseInt(match[2]);
      if (sys < 70 || sys > 250) return "Systolic must be 70–250 mmHg";
      if (dia < 40 || dia > 150) return "Diastolic must be 40–150 mmHg";
      if (dia >= sys) return "Diastolic must be lower than systolic";
      return null;
    },
  },
  heart_rate: {
    hint: "Normal range: 40–220 bpm",
    validate: (v) => {
      const n = Number(v);
      if (isNaN(n) || !Number.isInteger(n)) return "Enter a whole number";
      if (n < 40 || n > 220) return "Heart rate must be 40–220 bpm";
      return null;
    },
  },
  blood_sugar: {
    hint: "Normal range: 20–600 mg/dL",
    validate: (v) => {
      const n = Number(v);
      if (isNaN(n)) return "Enter a valid number";
      if (n < 20 || n > 600) return "Blood sugar must be 20–600 mg/dL";
      return null;
    },
  },
  bmi: {
    hint: "Normal range: 10–60 kg/m²",
    validate: (v) => {
      const n = Number(v);
      if (isNaN(n)) return "Enter a valid number";
      if (n < 10 || n > 60) return "BMI must be 10–60 kg/m²";
      return null;
    },
  },
  spo2: {
    hint: "Normal range: 70–100%",
    validate: (v) => {
      const n = Number(v);
      if (isNaN(n)) return "Enter a valid number";
      if (n < 70 || n > 100) return "SpO₂ must be 70–100%";
      return null;
    },
  },
  temperature: {
    hint: "Normal range: 95–108 °F",
    validate: (v) => {
      const n = Number(v);
      if (isNaN(n)) return "Enter a valid number";
      if (n < 95 || n > 108) return "Temperature must be 95–108 °F";
      return null;
    },
  },
};

interface VitalCardProps {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  status: "normal" | "attention" | "critical";
  vitalType: string;
  recordedAt?: string | null;
  previousValue?: string | null;
  onLog: (vital: VitalInsert) => void;
  isLogging?: boolean;
}

const statusStyles = {
  normal: "text-success bg-success/10 border-success/20",
  attention: "text-warning bg-warning/10 border-warning/20",
  critical: "text-destructive bg-destructive/10 border-destructive/20",
};

const statusLabels = {
  normal: "In range",
  attention: "Watch",
  critical: "Critical",
};

const accentBars = {
  normal: "bg-success",
  attention: "bg-warning",
  critical: "bg-destructive",
};

export default function VitalCard({
  label,
  value,
  unit,
  icon: Icon,
  status,
  vitalType,
  recordedAt,
  previousValue,
  onLog,
  isLogging,
}: VitalCardProps) {
  const [open, setOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  const bounds = vitalBounds[vitalType];
  const normalRange = vitalNormalRange(vitalType);
  const hasReading = !!value && value !== "—";
  const trend = hasReading ? vitalTrend(vitalType, value, previousValue ?? undefined) : null;
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : ArrowRight;

  const previewStatus = newValue.trim()
    ? classifyVital(vitalType, newValue.trim(), "normal")
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = newValue.trim();
    if (!raw) return;

    if (bounds) {
      const error = bounds.validate(raw);
      if (error) {
        setValidationError(error);
        toast({ title: "Invalid Reading", description: error, variant: "destructive" });
        return;
      }
    }

    setValidationError(null);
    onLog({
      vital_type: vitalType,
      value: raw,
      unit,
      // Status is derived from medical ranges, never self-reported
      status: classifyVital(vitalType, raw, "normal"),
    });
    setNewValue("");
    setOpen(false);
  };

  return (
    <Card className="group relative overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      {hasReading && (
        <span className={`absolute left-0 top-0 h-full w-1 ${accentBars[status]}`} aria-hidden />
      )}
      <CardContent className="p-4 pl-5">
        <div className="mb-2 flex items-center justify-between">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {hasReading && (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyles[status]}`}
            >
              {statusLabels[status]}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5">
          <p className="font-display text-xl font-bold text-foreground">{value}</p>
          {trend && trend !== "flat" && (
            <TrendIcon
              className={`h-3.5 w-3.5 ${
                status === "normal" ? "text-muted-foreground" : "text-warning"
              }`}
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {label} · {unit}
        </p>

        <p className="mt-2 text-[10px] leading-tight text-muted-foreground/80">
          {hasReading && recordedAt
            ? `Updated ${formatDistanceToNow(new Date(recordedAt), { addSuffix: true })}`
            : normalRange
              ? `Healthy: ${normalRange}`
              : "No reading yet"}
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-6 w-6 opacity-60 transition-opacity group-hover:opacity-100"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Log {label}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Reading ({unit})</Label>
                <Input
                  placeholder={vitalType === "blood_pressure" ? "e.g. 120/80" : "e.g. 72"}
                  value={newValue}
                  onChange={(e) => {
                    setNewValue(e.target.value);
                    setValidationError(null);
                  }}
                  className={validationError ? "border-destructive" : ""}
                  required
                />
                {validationError && (
                  <p className="text-xs text-destructive">{validationError}</p>
                )}
                {bounds && !validationError && (
                  <p className="text-[11px] text-muted-foreground">{bounds.hint}</p>
                )}
              </div>

              {normalRange && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                  <p className="text-muted-foreground">
                    Healthy range: <span className="font-medium text-foreground">{normalRange}</span>
                  </p>
                  {previewStatus && !validationError && (
                    <p className="mt-1.5">
                      This reading is classified as{" "}
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyles[previewStatus]}`}
                      >
                        {statusLabels[previewStatus]}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLogging}>
                Save Reading
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

