import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function StartupGreeting() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);

  useEffect(() => {
    // Only start the timer once auth has finished loading
    if (!loading) {
      setHasStartedAnimation(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2800); // Show splash for a fixed time to give the Nokia feel

      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
        >
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Namaste Hands Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={hasStartedAnimation ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative flex items-center justify-center h-32 w-32 rounded-full bg-primary/10"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-16 w-16 text-primary"
              >
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
            </motion.div>

            {/* Greeting Text */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={hasStartedAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-center"
            >
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
                Namaste
              </h1>
              {user && user.user_metadata?.full_name ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="mt-2 text-xl font-medium text-primary"
                >
                  {user.user_metadata.full_name}
                </motion.p>
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="mt-2 text-xl font-medium text-muted-foreground"
                >
                  My Health Compass
                </motion.p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
