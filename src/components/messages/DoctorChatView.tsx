import { useState, useRef, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Send, ArrowLeft, Phone, Video, Paperclip, Image, FileText, X, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Conversation, Message, CallLog, useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useVideoCall } from "@/hooks/useVideoCall";
import { usePresence } from "@/hooks/usePresence";
import { useCallRecording } from "@/hooks/useCallRecording";
import { useToast } from "@/hooks/use-toast";
import CallScreen from "./CallScreen";
import IncomingCallDialog from "./IncomingCallDialog";

interface DoctorChatViewProps {
  conversation: Conversation;
  onBack: () => void;
}

export default function DoctorChatView({ conversation, onBack }: DoctorChatViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { useConversationMessages, sendMessage, uploadAttachment, useCallLogs, logCall, useRealtimeMessages } = useMessages("doctor");
  const { data: messages, isLoading } = useConversationMessages(conversation.id);
  const { data: callLogs } = useCallLogs(conversation.id);
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patientName = conversation.patient?.full_name || "Patient";

  const call = useVideoCall(conversation.id, patientName);
  const { isRemoteOnline } = usePresence(conversation.id);
  const recording = useCallRecording();
  const isPatientOnline = isRemoteOnline(conversation.patient_id);

  // Toggle recording
  const handleToggleRecording = useCallback(() => {
    if (recording.isRecording) {
      recording.stopRecording();
    } else {
      recording.startRecording(call.localStream, call.remoteStream);
    }
  }, [recording, call.localStream, call.remoteStream]);

  // Auto-upload recording when blob is ready
  useEffect(() => {
    if (!recording.recordingBlob) return;
    const uploadRecording = async () => {
      try {
        const file = new File(
          [recording.recordingBlob!],
          `call-recording-${Date.now()}.webm`,
          { type: "audio/webm" }
        );
        const result = await uploadAttachment(file, conversation.id);
        await sendMessage.mutateAsync({
          conversationId: conversation.id,
          content: "🎙️ Call Recording",
          attachmentUrl: result.url,
          attachmentType: result.type,
          attachmentName: result.name,
          senderType: "doctor",
        });
        toast({ title: "Recording saved", description: "Call recording shared in chat" });
      } catch (err: any) {
        toast({ title: "Upload failed", description: err.message, variant: "destructive" });
      }
      recording.clearRecording();
    };
    uploadRecording();
  }, [recording.recordingBlob]);

  // Stop recording when call ends
  useEffect(() => {
    if (call.status === "ended" && recording.isRecording) {
      recording.stopRecording();
    }
  }, [call.status, recording.isRecording]);

  useRealtimeMessages(conversation.id);

  // Auto-accept call when navigated from GlobalCallOverlay (incomingCall comes from shared store)
  const hasAutoAccepted = useRef(false);
  useEffect(() => {
    if (call.incomingCall && !hasAutoAccepted.current && call.status === "idle") {
      console.log("[DoctorChatView] Auto-accepting incoming call from store");
      hasAutoAccepted.current = true;
      call.acceptCall();
    }
  }, [call.incomingCall, call.status, call.acceptCall]);

  // Reset hasAutoAccepted when call ends so next call can be auto-accepted
  useEffect(() => {
    if (call.status === "ended" || call.status === "idle") {
      if (hasAutoAccepted.current && !call.incomingCall) {
        hasAutoAccepted.current = false;
      }
    }
  }, [call.status, call.incomingCall]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const prevStatus = useRef(call.status);
  useEffect(() => {
    if (prevStatus.current === "connected" && call.status === "ended") {
      logCall.mutate({
        conversationId: conversation.id,
        callType: call.callType,
        status: "completed",
        durationSeconds: call.callDuration,
      });
    } else if (prevStatus.current === "calling" && call.status === "idle") {
      logCall.mutate({
        conversationId: conversation.id,
        callType: call.callType,
        status: "missed",
      });
    }
    prevStatus.current = call.status;
  }, [call.status]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !pendingFile) return;

    try {
      let attachmentUrl: string | undefined;
      let attachmentType: string | undefined;
      let attachmentName: string | undefined;

      if (pendingFile) {
        setIsUploading(true);
        const result = await uploadAttachment(pendingFile, conversation.id);
        attachmentUrl = result.url;
        attachmentType = result.type;
        attachmentName = result.name;
        setPendingFile(null);
      }

      setInput("");
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: text || (attachmentName ? `📎 ${attachmentName}` : ""),
        attachmentUrl,
        attachmentType,
        attachmentName,
        senderType: "doctor",
      });
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10 MB", variant: "destructive" });
      return;
    }
    setPendingFile(file);
    e.target.value = "";
  };

  const isInCall = call.status === "calling" || call.status === "connected" || call.status === "ended";

  return (
    <>
      <AnimatePresence>
        {call.incomingCall && (
          <IncomingCallDialog
            callerName={call.incomingCall.callerName}
            callType={call.incomingCall.callType}
            onAccept={call.acceptCall}
            onReject={call.rejectCall}
          />
        )}
      </AnimatePresence>

      {isInCall && (
        <CallScreen
          status={call.status}
          callType={call.callType}
          callerName={call.callerName}
          callDuration={call.callDuration}
          isMuted={call.isMuted}
          isVideoOff={call.isVideoOff}
          localStream={call.localStream}
          remoteStream={call.remoteStream}
          isRemoteOnline={isPatientOnline}
          isRecording={recording.isRecording}
          recordingDuration={recording.recordingDuration}
          connectionState={call.connectionState}
          onEndCall={call.endCall}
          onToggleMute={call.toggleMute}
          onToggleVideo={call.toggleVideo}
          onToggleRecording={handleToggleRecording}
        />
      )}

      <div className="flex flex-col h-full">
        {/* Chat header */}
        <div className="flex items-center gap-3 p-3 border-b border-border bg-card/50 rounded-t-xl">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-9 w-9 rounded-full bg-accent/50 flex items-center justify-center text-sm font-medium text-foreground flex-shrink-0">
            {patientName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate text-foreground">{patientName}</h4>
            <p className="text-[10px] text-muted-foreground">Patient</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => call.startCall("audio")}
              disabled={isInCall}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => call.startCall("video")}
              disabled={isInCall}
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Call history */}
        {callLogs && callLogs.length > 0 && (
          <div className="border-b border-border bg-muted/30 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">Recent calls:</span>
            {callLogs.slice(0, 5).map((log) => (
              <CallLogBadge key={log.id} log={log} userId={user?.id || ""} />
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : messages && messages.length > 0 ? (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user?.id} />
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-3xl mb-2">👋</span>
              <p className="text-xs text-muted-foreground">
                Start a conversation with {patientName}
              </p>
            </div>
          )}
        </div>

        {/* Pending file */}
        {pendingFile && (
          <div className="mx-3 mb-1 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            {pendingFile.type.startsWith("image/") ? (
              <Image className="h-4 w-4 text-primary flex-shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-primary flex-shrink-0" />
            )}
            <span className="text-xs text-foreground truncate flex-1">{pendingFile.name}</span>
            <span className="text-[10px] text-muted-foreground">{(pendingFile.size / 1024).toFixed(0)} KB</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPendingFile(null)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border bg-card/50 rounded-b-xl">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              className="h-10 text-sm flex-1"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendMessage.isPending || isUploading}
            />
            <Button
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              onClick={handleSend}
              disabled={(!input.trim() && !pendingFile) || sendMessage.isPending || isUploading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Sub-components ─── */

function CallLogBadge({ log, userId }: { log: CallLog; userId: string }) {
  const isOutgoing = log.caller_id === userId;
  const Icon = log.status === "missed" ? PhoneMissed : isOutgoing ? PhoneOutgoing : PhoneIncoming;
  const color = log.status === "missed" ? "text-destructive" : "text-muted-foreground";
  const durStr = log.duration_seconds > 0
    ? `${Math.floor(log.duration_seconds / 60)}:${String(log.duration_seconds % 60).padStart(2, "0")}`
    : "";

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 flex-shrink-0">
      <Icon className={`h-3 w-3 ${color}`} />
      <span className="text-[10px] text-muted-foreground">
        {log.call_type === "video" ? "📹" : "📞"}{" "}
        {format(new Date(log.started_at), "MMM d, h:mm a")}
        {durStr && ` · ${durStr}`}
      </span>
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const hasAttachment = !!message.attachment_url;
  const isImage = message.attachment_type?.startsWith("image/");

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${isOwn
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-muted text-foreground rounded-bl-md"
          }`}
      >
        {hasAttachment && (
          <a
            href={message.attachment_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-1.5"
          >
            {isImage ? (
              <img
                src={message.attachment_url!}
                alt={message.attachment_name || "attachment"}
                className="rounded-lg max-h-48 w-auto object-cover"
                loading="lazy"
              />
            ) : (
              <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${isOwn ? "border-primary-foreground/20" : "border-border"
                }`}>
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs truncate">{message.attachment_name}</span>
              </div>
            )}
          </a>
        )}

        {message.content && !message.content.startsWith("📎 ") && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}
        <p className={`text-[9px] mt-1 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {format(new Date(message.created_at), "h:mm a")}
        </p>
      </div>
    </div>
  );
}
