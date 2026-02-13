import { useState, useRef, useCallback } from "react";

export interface RecordingState {
  isRecording: boolean;
  recordingDuration: number;
  recordingBlob: Blob | null;
}

/**
 * Hook to record call audio by mixing local + remote streams.
 * Returns a blob when recording is stopped.
 */
export function useCallRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mixedStreamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(
    (localStream: MediaStream | null, remoteStream: MediaStream | null) => {
      try {
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();

        // Mix local audio
        if (localStream) {
          const localSource = audioContext.createMediaStreamSource(localStream);
          localSource.connect(destination);
        }

        // Mix remote audio
        if (remoteStream) {
          const remoteSource = audioContext.createMediaStreamSource(remoteStream);
          remoteSource.connect(destination);
        }

        mixedStreamRef.current = destination.stream;
        chunksRef.current = [];
        setRecordingBlob(null);
        setRecordingDuration(0);

        const recorder = new MediaRecorder(destination.stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm",
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          setRecordingBlob(blob);
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
          setRecordingDuration(0);
        };

        recorder.start(1000); // collect in 1s chunks
        recorderRef.current = recorder;
        setIsRecording(true);

        // Duration timer
        timerRef.current = setInterval(() => {
          setRecordingDuration((d) => d + 1);
        }, 1000);

        console.log("Call recording started");
      } catch (err) {
        console.error("Failed to start recording:", err);
      }
    },
    []
  );

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      console.log("Call recording stopped");
    }
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current = null;
  }, []);

  const clearRecording = useCallback(() => {
    setRecordingBlob(null);
    setRecordingDuration(0);
  }, []);

  return {
    isRecording,
    recordingDuration,
    recordingBlob,
    startRecording,
    stopRecording,
    clearRecording,
  };
}
