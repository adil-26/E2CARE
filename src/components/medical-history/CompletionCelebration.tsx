import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CompletionCelebrationProps {
  show: boolean;
  onClose: () => void;
}

const emojis = ["🎉", "🩺", "✅", "💪", "⭐", "🏆", "❤️", "🎊"];

interface Particle {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export default function CompletionCelebration({ show, onClose }: CompletionCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random() * 1.5,
        size: 16 + Math.random() * 16,
      }));
      setParticles(newParticles);

      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Confetti particles */}
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ y: -20, x: `${p.x}vw`, opacity: 1, scale: 0 }}
              animate={{
                y: "100vh",
                opacity: [1, 1, 0],
                scale: [0, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeOut",
              }}
              className="fixed top-0"
              style={{ fontSize: p.size, left: 0 }}
            >
              {p.emoji}
            </motion.span>
          ))}

          {/* Center celebration card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
            className="pointer-events-auto bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8 text-center max-w-xs mx-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-5xl sm:text-6xl mb-3"
            >
              🏆
            </motion.div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-1.5">
              All Done!
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your medical history is complete. Your doctor will have a comprehensive view of your health.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-[10px] text-muted-foreground/60"
            >
              Tap to dismiss
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
