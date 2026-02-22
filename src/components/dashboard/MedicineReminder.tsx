import { useState } from "react";
import { motion } from "framer-motion";
import { Pill, Plus, Clock, Sun, Moon, Sunset } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Medication } from "@/hooks/useMedications";
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";

interface MedicineReminderProps {
  medications: Medication[];
  onAdd: (med: Omit<Medication, "id" | "is_active">) => void;
  isAdding?: boolean;
}

const scheduleIcons: Record<string, typeof Sun> = {
  morning: Sun,
  afternoon: Sunset,
  night: Moon,
};

const scheduleOptions = ["morning", "afternoon", "night"];

export default function MedicineReminder({ medications, onAdd, isAdding }: MedicineReminderProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [schedule, setSchedule] = useState<string[]>([]);
  const [prescribedBy, setPrescribedBy] = useState("");

  const toggleSchedule = (time: string) => {
    setSchedule((prev) =>
      prev.includes(time) ? prev.filter((s) => s !== time) : [...prev, time]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;
    onAdd({
      name,
      dosage,
      frequency: frequency || t.medications.asNeeded,
      schedule,
      prescribed_by: prescribedBy || null,
      start_date: new Date().toISOString().split("T")[0],
      end_date: null,
      notes: null,
    });
    setName("");
    setDosage("");
    setFrequency("");
    setSchedule([]);
    setPrescribedBy("");
    setOpen(false);
  };

  // Determine current time of day
  const hour = new Date().getHours();
  const currentTime = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "night";

  const dueMeds = medications.filter((m) =>
    m.schedule.includes(currentTime)
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Pill className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-semibold text-foreground">
            {t.medications.title}
          </h3>
          <HearOutButton text={t.medications.title} />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
              <Plus className="h-3 w-3" /> {t.medications.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{t.medications.addMedication}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>{t.medications.name}</Label>
                <Input placeholder="e.g. Metformin" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t.medications.dosage}</Label>
                  <Input placeholder="e.g. 500mg" value={dosage} onChange={(e) => setDosage(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.medications.frequency}</Label>
                  <Input placeholder="e.g. twice daily" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t.medications.schedule}</Label>
                <div className="flex gap-3">
                  {scheduleOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-sm capitalize cursor-pointer">
                      <Checkbox
                        checked={schedule.includes(opt)}
                        onCheckedChange={() => toggleSchedule(opt)}
                      />
                      {t.medications[opt as keyof typeof t.medications]}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t.medications.prescribedBy}</Label>
                <Input placeholder="Dr. Name" value={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={isAdding}>
                {t.medications.saveMedication}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Pill className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.medications.noMeds}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {dueMeds.length > 0 && (
            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardContent className="p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  {t.medications.dueNow} ({t.medications[currentTime as keyof typeof t.medications]})
                </p>
                <div className="space-y-1.5">
                  {dueMeds.map((med) => (
                    <div key={med.id} className="flex items-center justify-between rounded-lg bg-card p-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dosage}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {med.frequency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardContent className="divide-y divide-border p-0">
              {medications.map((med, i) => {
                // Find icon for the first schedule item
                const scheduleKey = med.schedule[0];
                const ScheduleIcon = scheduleIcons[scheduleKey] || Clock;
                return (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <ScheduleIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} · {med.schedule.map(s => t.medications[s as keyof typeof t.medications]).join(", ")}
                      </p>
                    </div>
                    {med.prescribed_by && (
                      <span className="text-[10px] text-muted-foreground">
                        {t.common.doctor}: {med.prescribed_by}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
