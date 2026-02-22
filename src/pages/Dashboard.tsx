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
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { t } = useLanguage();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

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
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            {t.dashboard.greeting}, {firstName}
          </h1>
          <HearOutButton text={`${t.dashboard.greeting}, ${firstName}. ${t.dashboard.welcome}.`} />
        </div>
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div className="flex-1">
              <p className="text-sm opacity-90">{t.dashboard.healthStatus}</p>
              <h2 className="font-display text-2xl font-bold">
                {healthScore >= 80 ? t.dashboard.stable : healthScore >= 50 ? t.dashboard.attention : latestVitals.length === 0 ? t.dashboard.logVitals : t.dashboard.critical}
              </h2>
              <p className="mt-1 text-sm opacity-80">
                {latestVitals.length === 0
                  ? t.dashboard.startLogging
                  : t.dashboard.basedOnReadings}
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
            { label: t.nav.appointments, icon: Calendar, path: "/appointments" },
            { label: t.common.upload, icon: Upload, path: "/records" },
            { label: "ID Card", icon: QrCode, path: "/emergency" },
            { label: t.nav.aiChat, icon: Bot, path: "/chat" },
            { label: t.nav.referrals, icon: Gift, path: "/referrals" },
          ].map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto flex-col gap-1.5 py-3 shadow-sm px-1"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-medium leading-tight text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Vitals Grid */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">{t.dashboard.yourVitals}</h3>
          <HearOutButton text={t.dashboard.yourVitals} />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {vitals.map((vital) => (
            <VitalCard
              key={vital.type}
              label={t.vitals[vital.type as keyof typeof t.vitals]}
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
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">{t.dashboard.dailyRoutine}</h3>
          <HearOutButton text={t.dashboard.dailyRoutine} />
        </div>
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
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">
            {t.dashboard.upcomingAppointment}
          </h3>
          <HearOutButton text={t.dashboard.upcomingAppointment} />
        </div>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{t.dashboard.noAppointments}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.bookOne}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/appointments")}>
              {t.dashboard.book}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
