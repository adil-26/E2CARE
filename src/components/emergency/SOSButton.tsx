import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";

interface SOSButtonProps {
  onActivate: () => void;
}

export default function SOSButton({ onActivate }: SOSButtonProps) {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!pressing) {
      setProgress(0);
      return;
    }

    const start = Date.now();
    const duration = 2000; // 2 seconds hold

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct);

      if (pct >= 1) {
        clearInterval(interval);
        onActivate();
        setPressing(false);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [pressing, onActivate]);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        className="relative flex h-32 w-32 items-center justify-center rounded-full bg-destructive shadow-lg select-none"
        onPointerDown={() => setPressing(true)}
        onPointerUp={() => setPressing(false)}
        onPointerLeave={() => setPressing(false)}
        whileTap={{ scale: 0.95 }}
      >
        {/* Progress ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="hsl(var(--destructive-foreground))"
            strokeWidth="4"
            strokeOpacity="0.3"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="hsl(var(--destructive-foreground))"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 60}
            strokeDashoffset={2 * Math.PI * 60 * (1 - progress)}
            style={{ transition: "stroke-dashoffset 0.05s linear" }}
          />
        </svg>

        <div className="flex flex-col items-center gap-1 text-destructive-foreground z-10">
          <Phone className="h-8 w-8" />
          <span className="text-sm font-bold tracking-wide">SOS</span>
        </div>

        {/* Pulse animation */}
        <AnimatePresence>
          {pressing && (
            <motion.div
              className="absolute inset-0 rounded-full bg-destructive"
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      <p className="text-xs text-muted-foreground text-center">
        {pressing ? "Keep holding..." : "Hold for 2 seconds to call emergency"}
      </p>
    </div>
  );
}
