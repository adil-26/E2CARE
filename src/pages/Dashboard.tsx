import { useAuth } from "@/hooks/useAuth";
import { useVitals } from "@/hooks/useVitals";
import { useDailyRoutine } from "@/hooks/useDailyRoutine";
import { useMedications } from "@/hooks/useMedications";
import { useAppointments } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { getEffectiveStatus, appointmentDateTime } from "@/lib/appointmentStatus";
import { classifyVital, computeHealthScore } from "@/lib/vitalRanges";

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
  Leaf,
  CalendarX,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HealthScoreGauge from "@/components/dashboard/HealthScoreGauge";
import ProfileCompletionMeter from "@/components/dashboard/ProfileCompletionMeter";
import VitalCard from "@/components/dashboard/VitalCard";
import DailyRoutineTracker from "@/components/dashboard/DailyRoutineTracker";
import MedicineReminder from "@/components/dashboard/MedicineReminder";
import { ClinicalAlertsWidget } from "@/components/doctor/ClinicalAlertsWidget";
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IdCardDialog } from "@/components/patient/IdCardDialog";

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

const scoreLabel = (score: number, count: number) => {
  if (count === 0) return "no-data";
  if (score >= 80) return "stable";
  if (score >= 50) return "attention";
  return "critical";
};


export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { vitals: allVitals, latestVitals, addVital } = useVitals();
  const { routine, upsertRoutine } = useDailyRoutine();
  const { medications, addMedication, logMedicine } = useMedications();
  const { t } = useLanguage();
  const { appointments } = useAppointments();

  const needsReview = appointments.filter((a) => getEffectiveStatus(a) === "pending_review");
  const nextAppointment = appointments
    .filter((a) => ["today", "upcoming"].includes(getEffectiveStatus(a)))
    .sort((a, b) => appointmentDateTime(a).getTime() - appointmentDateTime(b).getTime())[0];

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  // Merge latest vitals onto defaults, classifying each reading against medical ranges
  const vitals = vitalDefaults.map((def) => {
    const history = allVitals.filter((v) => v.vital_type === def.type);
    const latest = history[0];
    if (!latest) return { ...def, recordedAt: null, previousValue: null };
    return {
      ...def,
      value: latest.value,
      status: classifyVital(def.type, latest.value, latest.status as any),
      recordedAt: latest.recorded_at,
      previousValue: history[1]?.value ?? null,
    };
  });

  const healthScore = computeHealthScore(latestVitals);
  const scoreState = scoreLabel(healthScore, latestVitals.length);
  const flagged = vitals.filter((v) => v.value !== "—" && v.status !== "normal");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Top Banner Alerts */}
      {user?.id && (
        <motion.div variants={item}>
          <ClinicalAlertsWidget patientId={user.id} />
        </motion.div>
      )}

      {/* Health Status + Score */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="text-sm opacity-90">{t.dashboard.healthStatus}</p>
                <HearOutButton text={`${t.dashboard.healthStatus}. ${t.dashboard.basedOnReadings}.`} />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {scoreState === "no-data"
                  ? t.dashboard.logVitals
                  : scoreState === "stable"
                    ? t.dashboard.stable
                    : scoreState === "attention"
                      ? t.dashboard.attention
                      : t.dashboard.critical}
              </h2>
              <p className="mt-1 text-sm opacity-80">
                {scoreState === "no-data"
                  ? t.dashboard.startLogging
                  : flagged.length > 0
                    ? `${flagged.length} reading${flagged.length > 1 ? "s" : ""} outside the healthy range: ${flagged
                        .map((f) => f.label)
                        .join(", ")}`
                    : latestVitals.length < 6
                      ? `${latestVitals.length} of 6 vitals tracked — log the rest for a fuller picture`
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
            { label: "ID Card", icon: QrCode, isIdCard: true },
            { label: "Plans", icon: Leaf, path: "/treatments" },
            { label: "Diet", icon: Apple, path: "/diet-plan" },
            { label: t.nav.aiChat, icon: Bot, path: "/chat" },
          ].map((action) => {
            const btn = (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col gap-1.5 py-3 shadow-sm px-1 w-full"
                onClick={() => action.path && navigate(action.path)}
              >
                <action.icon className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-medium leading-tight text-center">{action.label}</span>
              </Button>
            );

            if (action.isIdCard && profile && user) {
              return (
                <IdCardDialog 
                  key={action.label}
                  patient={{...profile, avatar_url: user?.user_metadata?.avatar_url}} 
                  patientId={user.id} 
                  trigger={btn} 
                />
              );
            }
            return btn;
          })}
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
              recordedAt={vital.recordedAt}
              previousValue={vital.previousValue}

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
          onLog={(medId) => logMedicine.mutate({ medId })}
          isLogging={logMedicine.isPending}
        />
      </motion.div>

      {/* Appointments */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">
            {t.dashboard.upcomingAppointment}
          </h3>
          <HearOutButton text={t.dashboard.upcomingAppointment} />
        </div>

        {needsReview.length > 0 && (
          <Card className="shadow-sm mb-3 border-amber-200 bg-amber-50/60">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <CalendarX className="h-5 w-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-900">
                  {needsReview.length} past appointment{needsReview.length > 1 ? "s" : ""} need an update
                </p>
                <p className="text-xs text-amber-700">Tell us if you attended or missed them.</p>
              </div>
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-800" onClick={() => navigate("/appointments")}>
                Review
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {nextAppointment ? (
                <>
                  <p className="font-medium text-foreground truncate">
                    {nextAppointment.doctor?.full_name || "Doctor"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {format(appointmentDateTime(nextAppointment), "EEE, d MMM")} ·{" "}
                    {nextAppointment.start_time?.slice(0, 5)}
                    {nextAppointment.doctor?.specialization ? ` · ${nextAppointment.doctor.specialization}` : ""}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground">{t.dashboard.noAppointments}</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.bookOne}</p>
                </>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/appointments")}>
              {nextAppointment ? "View" : t.dashboard.book}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
}
