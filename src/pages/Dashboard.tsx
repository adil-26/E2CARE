import { useAuth } from "@/hooks/useAuth";
import { useVitals } from "@/hooks/useVitals";
import { useDailyRoutine } from "@/hooks/useDailyRoutine";
import { useMedications } from "@/hooks/useMedications";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Upload,
  QrCode,
  Heart,
  Droplets,
  Activity,
  TrendingUp,
  Thermometer,
  Wind,
  Bot,
  Gift,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HealthScoreGauge from "@/components/dashboard/HealthScoreGauge";
import ProfileCompletionMeter from "@/components/dashboard/ProfileCompletionMeter";
import VitalCard from "@/components/dashboard/VitalCard";
import DailyRoutineTracker from "@/components/dashboard/DailyRoutineTracker";
import MedicineReminder from "@/components/dashboard/MedicineReminder";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const vitalDefaults = [
  { type: "blood_pressure", label: "Blood Pressure", value: "—", unit: "mmHg", icon: Activity, status: "normal" as const },
  { type: "heart_rate", label: "Heart Rate", value: "—", unit: "bpm", icon: Heart, status: "normal" as const },
  { type: "blood_sugar", label: "Blood Sugar", value: "—", unit: "mg/dL", icon: Droplets, status: "normal" as const },
  { type: "bmi", label: "BMI", value: "—", unit: "kg/m²", icon: TrendingUp, status: "normal" as const },
  { type: "spo2", label: "SpO₂", value: "—", unit: "%", icon: Wind, status: "normal" as const },
  { type: "temperature", label: "Temperature", value: "—", unit: "°F", icon: Thermometer, status: "normal" as const },
];

function computeHealthScore(latestVitals: { vital_type: string; status: string }[]): number {
  if (latestVitals.length === 0) return 0;
  const scoreMap = { normal: 100, attention: 60, critical: 20 };
  const total = latestVitals.reduce(
    (sum, v) => sum + (scoreMap[v.status as keyof typeof scoreMap] ?? 50),
    0
  );
  return Math.round(total / latestVitals.length);
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { latestVitals, addVital } = useVitals();
  const { routine, upsertRoutine } = useDailyRoutine();
  const { medications, addMedication } = useMedications();

  // Merge latest vitals onto defaults
  const vitals = vitalDefaults.map((def) => {
    const latest = latestVitals.find((v) => v.vital_type === def.type);
    return latest
      ? { ...def, value: latest.value, status: latest.status as "normal" | "attention" | "critical" }
      : def;
  });

  const healthScore = computeHealthScore(latestVitals);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Health Status + Score */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div className="flex-1">
              <p className="text-sm opacity-90">Health Status</p>
              <h2 className="font-display text-2xl font-bold">
                {healthScore >= 80 ? "Stable" : healthScore >= 50 ? "Attention" : latestVitals.length === 0 ? "Log Vitals" : "Critical"}
              </h2>
              <p className="mt-1 text-sm opacity-80">
                {latestVitals.length === 0
                  ? "Start by logging your vitals below"
                  : "Based on your latest readings"}
              </p>
            </div>
            <div className="flex-shrink-0 rounded-2xl bg-white/15 p-2 backdrop-blur-sm">
              <HealthScoreGauge score={healthScore} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Completion Meter */}
      <motion.div variants={item}>
        <ProfileCompletionMeter />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "Book Appt", icon: Calendar, path: "/appointments" },
            { label: "Upload", icon: Upload, path: "/records" },
            { label: "Medical ID", icon: QrCode, path: "/emergency" },
            { label: "AI Chat", icon: Bot, path: "/chat" },
            { label: "Referrals", icon: Gift, path: "/referrals" },
          ].map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto flex-col gap-1.5 py-3 shadow-sm"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-5 w-5 text-primary" />
              <span className="text-[11px] font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Vitals Grid */}
      <motion.div variants={item}>
        <h3 className="mb-3 font-display text-base font-semibold text-foreground">Your Vitals</h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {vitals.map((vital) => (
            <VitalCard
              key={vital.type}
              label={vital.label}
              value={vital.value}
              unit={vital.unit}
              icon={vital.icon}
              status={vital.status}
              vitalType={vital.type}
              onLog={(v) => addVital.mutate(v)}
              isLogging={addVital.isPending}
            />
          ))}
        </div>
      </motion.div>

      {/* Daily Routine */}
      <motion.div variants={item}>
        <h3 className="mb-3 font-display text-base font-semibold text-foreground">Daily Routine</h3>
        <DailyRoutineTracker
          routine={routine}
          onUpdate={(updates) => upsertRoutine.mutate(updates)}
        />
      </motion.div>

      {/* Medicine Reminders */}
      <motion.div variants={item}>
        <MedicineReminder
          medications={medications}
          onAdd={(med) => addMedication.mutate(med)}
          isAdding={addMedication.isPending}
        />
      </motion.div>

      {/* Upcoming Appointment */}
      <motion.div variants={item}>
        <h3 className="mb-3 font-display text-base font-semibold text-foreground">
          Upcoming Appointment
        </h3>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">No upcoming appointments</p>
              <p className="text-sm text-muted-foreground">Book one to get started</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/appointments")}>
              Book
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
