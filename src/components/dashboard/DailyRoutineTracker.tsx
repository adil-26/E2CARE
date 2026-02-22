import { motion } from "framer-motion";
import { Minus, Plus, Check, X, Footprints, Moon, Dumbbell, GlassWater } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DailyRoutine } from "@/hooks/useDailyRoutine";
import { useLanguage } from "@/contexts/LanguageContext";

interface DailyRoutineTrackerProps {
  routine: DailyRoutine;
  onUpdate: (updates: Partial<Omit<DailyRoutine, "id" | "routine_date">>) => void;
}

export default function DailyRoutineTracker({ routine, onUpdate }: DailyRoutineTrackerProps) {
  const { t } = useLanguage();
  const handleUpdate = (key: keyof DailyRoutine, value: number) => {
    onUpdate({ [key]: value });
  };

  const waterTarget = 8;
  const sleepTarget = 7; // Lower bound of 7-9
  const stepsTarget = 6000;
  const exerciseTarget = 30; // 30 mins

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Hydration Column */}
      <Card className="overflow-hidden border-none bg-blue-50/50 shadow-sm dark:bg-blue-950/20">
        <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
            <GlassWater className="h-5 w-5" /> {t.routine.hydration}
          </div>

          <div className="relative mb-6 h-40 w-20 overflow-hidden rounded-b-xl rounded-t-sm border-4 border-blue-200 bg-white/50 backdrop-blur-sm dark:border-blue-800 dark:bg-black/20">
            <motion.div
              className="absolute bottom-0 w-full bg-blue-400 dark:bg-blue-500"
              initial={{ height: "0%" }}
              animate={{ height: `${Math.min((routine.water_glasses / waterTarget) * 100, 100)}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>

          <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {routine.water_glasses}<span className="text-lg text-muted-foreground">/{waterTarget}</span>
          </div>
          <p className="mb-6 text-sm text-blue-600/60 dark:text-blue-400/60">{t.routine.glasses}</p>

          {routine.water_glasses < waterTarget && (
            <div className="mb-6 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              ⚠️ {waterTarget - routine.water_glasses} {t.routine.behind}
            </div>
          )}

          <Button
            variant="link"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
            onClick={() => handleUpdate("water_glasses", routine.water_glasses + 1)}
          >
            {t.routine.tapToDrink}
          </Button>
        </CardContent>
      </Card>

      {/* Right Column: Sleep, Exercise, Steps */}
      <div className="space-y-4">
        {/* Sleep Card */}
        <Card className="border-none bg-violet-50/50 shadow-sm dark:bg-violet-950/20">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-violet-900 dark:text-violet-100">{t.routine.sleep}</h4>
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 rounded-full border-violet-200 bg-white hover:bg-violet-50 dark:border-violet-800 dark:bg-transparent dark:hover:bg-violet-900/50"
                    onClick={() => handleUpdate("sleep_hours", Math.max(0, routine.sleep_hours - 0.5))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-lg font-bold text-violet-700 dark:text-violet-300">{routine.sleep_hours} {t.routine.hours}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 rounded-full border-violet-200 bg-white hover:bg-violet-50 dark:border-violet-800 dark:bg-transparent dark:hover:bg-violet-900/50"
                    onClick={() => handleUpdate("sleep_hours", routine.sleep_hours + 0.5)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.routine.recommended}: 7-9 {t.routine.hours}</p>
              </div>
            </div>
            {routine.sleep_hours >= sleepTarget && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {t.routine.good}
              </span>
            )}
          </CardContent>
        </Card>

        {/* Exercise Card */}
        <Card className="border-none bg-red-50/50 shadow-sm dark:bg-red-950/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 dark:text-red-100">{t.routine.exercise}</h4>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant={routine.exercise_minutes >= exerciseTarget ? "default" : "outline"}
                  className={routine.exercise_minutes >= exerciseTarget ? "bg-red-500 hover:bg-red-600" : "bg-white hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900/20"}
                  onClick={() => handleUpdate("exercise_minutes", exerciseTarget)}
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" /> {t.routine.done}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900/20"
                  onClick={() => handleUpdate("exercise_minutes", 0)}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" /> {t.routine.skipped}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps Card */}
        <Card className="border-none bg-emerald-50/50 shadow-sm dark:bg-emerald-950/20">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
                <Footprints className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">{t.routine.steps}</h4>
                <div className="flex items-baseline gap-2">
                  <div className="relative">
                    {/* Simple ring placeholder using generic circular logic or SVG */}
                    <svg className="h-10 w-10 -rotate-90 transform">
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-emerald-200 dark:text-emerald-900"
                      />
                      <motion.circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={100}
                        strokeDashoffset={100 - Math.min((routine.steps / stepsTarget) * 100, 100)}
                        className="text-emerald-500 dark:text-emerald-400"
                        initial={{ strokeDashoffset: 100 }}
                        animate={{ strokeDashoffset: 100 - Math.min((routine.steps / stepsTarget) * 100, 100) }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      {Math.round((routine.steps / stepsTarget) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{routine.steps}</div>
                    <p className="text-xs text-muted-foreground">{stepsTarget.toLocaleString()} {t.routine.toGo}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {t.routine.goal}: {stepsTarget.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
