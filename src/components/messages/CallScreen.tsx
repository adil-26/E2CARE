import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallStatus, CallType } from "@/hooks/useVideoCall";

interface CallScreenProps {
  status: CallStatus;
  callType: CallType;
  callerName: string;
  callDuration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isRemoteOnline?: boolean;
  isRecording?: boolean;
  recordingDuration?: number;
  connectionState?: RTCIceConnectionState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleRecording?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getCallingLabel(status: CallStatus, isRemoteOnline: boolean, connectionState?: RTCIceConnectionState): string {
  if (connectionState === "disconnected") return "Reconnecting...";
  if (connectionState === "failed") return "Connection Failed";
  if (status === "calling") return isRemoteOnline ? "Ringing…" : "Calling…";
  if (status === "connected") return "Connected";
  if (status === "ended") return "Call ended";
  return "";
}

export default function CallScreen({
  status,
  callType,
  callerName,
  callDuration,
  isMuted,
  isVideoOff,
  localStream,
  remoteStream,
  isRemoteOnline = false,
  isRecording = false,
  recordingDuration = 0,
  connectionState,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleRecording,
}: CallScreenProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const isVideo = callType === "video";
  const statusLabel = getCallingLabel(status, isRemoteOnline, connectionState);
  const isConnected = status === "connected" && connectionState !== "disconnected";

  // ─── Recording indicator ───
  const RecordingBadge = () =>
    isRecording ? (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 rounded-full bg-destructive/90 px-2.5 py-1 shadow-md"
      >
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="h-2 w-2 rounded-full bg-destructive-foreground"
        />
        <span className="text-[10px] font-semibold text-destructive-foreground">
          REC {formatDuration(recordingDuration)}
        </span>
      </motion.div>
    ) : null;

  // ─── Compact banner for audio calls ───
  if (!isVideo) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed left-0 right-0 top-0 z-50 flex items-center gap-3 border-b border-border bg-card px-4 py-3 shadow-lg"
        >
          <motion.div
            animate={status === "calling" || connectionState === "disconnected" ? { scale: [1, 1.15, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${connectionState === "disconnected" ? "bg-destructive/10 text-destructive" : "bg-primary/10"
              }`}
          >
            {isConnected ? "🩺" : "📞"}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate">{callerName}</p>
              <RecordingBadge />
            </div>
            <p className={`text-xs ${connectionState === "disconnected" ? "text-destructive font-medium" : "text-muted-foreground"}`}>
              {isConnected ? formatDuration(callDuration) : statusLabel}
            </p>
          </div>

          {isConnected && (
            <div className="flex items-center gap-0.5 mr-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 14 + Math.random() * 8, 4] }}
                  transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.3, delay: i * 0.08 }}
                  className="w-[3px] rounded-full bg-primary"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {isConnected && onToggleRecording && (
              <Button
                size="icon"
                variant={isRecording ? "destructive" : "secondary"}
                className="h-9 w-9 rounded-full"
                onClick={onToggleRecording}
                title={isRecording ? "Stop recording" : "Record call"}
              >
                <Circle className={`h-4 w-4 ${isRecording ? "fill-current" : ""}`} />
              </Button>
            )}
            <Button
              size="icon"
              variant={isMuted ? "destructive" : "secondary"}
              className="h-9 w-9 rounded-full"
              onClick={onToggleMute}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="h-9 w-9 rounded-full"
              onClick={onEndCall}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─── Fullscreen for video calls ───
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl"
      >
        <div className="relative flex-1">
          {isConnected && remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted/30">
              <motion.div
                animate={status === "calling" ? { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl shadow-lg"
              >
                📹
              </motion.div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground">{callerName}</h3>
                <p className={`mt-1 text-sm ${connectionState === "disconnected" ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {statusLabel}
                </p>
              </div>
            </div>
          )}

          {/* Local PiP */}
          {localStream && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute overflow-hidden rounded-2xl border-2 border-background shadow-xl ${isConnected
                ? "right-4 top-4 h-36 w-24 sm:h-48 sm:w-32"
                : "bottom-28 left-1/2 h-48 w-36 -translate-x-1/2 sm:h-56 sm:w-40"
                }`}
            >
              <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <VideoOff className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          )}

          {/* Duration + recording overlay */}
          {isConnected && (
            <div className="absolute left-1/2 top-4 -translate-x-1/2 flex items-center gap-2">
              <div className="rounded-full bg-background/60 px-4 py-1.5 backdrop-blur-md">
                <p className="text-xs font-medium text-foreground">{formatDuration(callDuration)}</p>
              </div>
              <RecordingBadge />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="safe-area-bottom flex items-center justify-center gap-4 pb-10 pt-6">
          {status !== "ended" && (
            <>
              <Button
                size="icon"
                variant={isMuted ? "destructive" : "secondary"}
                className="h-14 w-14 rounded-full shadow-md"
                onClick={onToggleMute}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {isConnected && onToggleRecording && (
                <Button
                  size="icon"
                  variant={isRecording ? "destructive" : "secondary"}
                  className="h-14 w-14 rounded-full shadow-md"
                  onClick={onToggleRecording}
                  title={isRecording ? "Stop recording" : "Record call"}
                >
                  <Circle className={`h-5 w-5 ${isRecording ? "fill-current" : ""}`} />
                </Button>
              )}

              <Button
                size="icon"
                variant={isVideoOff ? "destructive" : "secondary"}
                className="h-14 w-14 rounded-full shadow-md"
                onClick={onToggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-16 w-16 rounded-full shadow-lg"
                onClick={onEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
