import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { VitalInsert } from "@/hooks/useVitals";

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
  onLog: (vital: VitalInsert) => void;
  isLogging?: boolean;
}

const statusStyles = {
  normal: "text-success bg-success/10 border-success/20",
  attention: "text-warning bg-warning/10 border-warning/20",
  critical: "text-destructive bg-destructive/10 border-destructive/20",
};

export default function VitalCard({
  label,
  value,
  unit,
  icon: Icon,
  status,
  vitalType,
  onLog,
  isLogging,
}: VitalCardProps) {
  const [open, setOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newStatus, setNewStatus] = useState<"normal" | "attention" | "critical">("normal");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  const bounds = vitalBounds[vitalType];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    // Validate input
    if (bounds) {
      const error = bounds.validate(newValue.trim());
      if (error) {
        setValidationError(error);
        toast({ title: "Invalid Reading", description: error, variant: "destructive" });
        return;
      }
    }

    setValidationError(null);
    onLog({
      vital_type: vitalType,
      value: newValue.trim(),
      unit,
      status: newStatus,
    });
    setNewValue("");
    setNewStatus("normal");
    setOpen(false);
  };

  return (
    <Card className="group relative shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyles[status]}`}
          >
            {status}
          </span>
        </div>
        <p className="font-display text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">
          {label} · {unit}
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="attention">Attention</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
