import { motion } from "framer-motion";

interface HealthScoreGaugeProps {
  score: number; // 0-100
}

export default function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getColor = () => {
    if (clampedScore >= 80) return "hsl(var(--vital-green))";
    if (clampedScore >= 50) return "hsl(var(--vital-yellow))";
    return "hsl(var(--vital-red))";
  };

  const getLabel = () => {
    if (clampedScore >= 80) return "Excellent";
    if (clampedScore >= 60) return "Good";
    if (clampedScore >= 40) return "Fair";
    return "Needs Attention";
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          {/* Score ring */}
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-display text-3xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {clampedScore}
          </motion.span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Score
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold" style={{ color: getColor() }}>
        {getLabel()}
      </p>
    </div>
  );
}
