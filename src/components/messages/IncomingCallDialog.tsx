import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Phone, PhoneOff, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallType } from "@/hooks/useVideoCall";

interface IncomingCallDialogProps {
  callerName: string;
  callType: CallType;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallDialog({
  callerName,
  callType,
  onAccept,
  onReject,
}: IncomingCallDialogProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Play ringtone when incoming call is displayed
  useEffect(() => {
    try {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 440; // A4 note
      oscillator.type = "sine";
      gainNode.gain.value = 0;
      oscillator.start();
      oscillatorRef.current = oscillator;

      // Create pulsing ringtone effect
      let isOn = true;
      const pulseInterval = setInterval(() => {
        if (gainNode && audioContext.state === "running") {
          gainNode.gain.setTargetAtTime(isOn ? 0.15 : 0, audioContext.currentTime, 0.05);
          isOn = !isOn;
        }
      }, 400);

      return () => {
        clearInterval(pulseInterval);
        try {
          oscillator.stop();
          audioContext.close();
        } catch { }
        audioContextRef.current = null;
        oscillatorRef.current = null;
      };
    } catch (err) {
      console.warn("[Call] Could not play ringtone:", err);
    }
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:left-auto sm:right-6 sm:top-6"
    >
      <div className="p-5">
        <div className="flex items-center gap-4">
          {/* Pulsing avatar */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl"
          >
            {callType === "video" ? "📹" : "📞"}
          </motion.div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{callerName}</p>
            <p className="text-xs text-muted-foreground">
              Incoming {callType === "video" ? "video" : "voice"} call…
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <Button
            size="sm"
            variant="destructive"
            className="h-10 gap-1.5 rounded-full px-5"
            onClick={onReject}
          >
            <PhoneOff className="h-4 w-4" />
            Decline
          </Button>
          <Button
            size="sm"
            className="h-10 gap-1.5 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
            onClick={onAccept}
          >
            {callType === "video" ? (
              <Video className="h-4 w-4" />
            ) : (
              <Phone className="h-4 w-4" />
            )}
            Accept
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
