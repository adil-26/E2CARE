import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DailyRoutine } from "@/hooks/useDailyRoutine";

interface DailyRoutineTrackerProps {
  routine: DailyRoutine;
  onUpdate: (updates: Partial<Omit<DailyRoutine, "id" | "routine_date">>) => void;
}

const routineConfig = [
  { key: "water_glasses" as const, label: "Water Intake", target: 8, unit: "glasses", emoji: "💧", step: 1 },
  { key: "sleep_hours" as const, label: "Sleep", target: 8, unit: "hours", emoji: "😴", step: 0.5 },
  { key: "steps" as const, label: "Steps", target: 10000, unit: "steps", emoji: "🚶", step: 500 },
  { key: "exercise_minutes" as const, label: "Exercise", target: 45, unit: "min", emoji: "🏃", step: 5 },
];

export default function DailyRoutineTracker({ routine, onUpdate }: DailyRoutineTrackerProps) {
  const handleIncrement = (key: keyof DailyRoutine, step: number) => {
    const current = Number(routine[key]) || 0;
    onUpdate({ [key]: current + step });
  };

  const handleDecrement = (key: keyof DailyRoutine, step: number) => {
    const current = Number(routine[key]) || 0;
    onUpdate({ [key]: Math.max(0, current - step) });
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-4">
        {routineConfig.map((item, index) => {
          const current = Number(routine[item.key]) || 0;
          const percentage = Math.min((current / item.target) * 100, 100);
          const isComplete = percentage >= 100;

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <span className="text-base">{item.emoji}</span> {item.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => handleDecrement(item.key, item.step)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="min-w-[4.5rem] text-center text-xs text-muted-foreground">
                    {current}/{item.target} {item.unit}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => handleIncrement(item.key, item.step)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Progress value={percentage} className="h-2.5" />
                {isComplete && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 text-xs"
                  >
                    ✅
                  </motion.span>
                )}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
