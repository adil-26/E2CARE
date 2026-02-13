import { AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useGlobalCallListener } from "@/hooks/useGlobalCallListener";
import { useRole } from "@/hooks/useRole";
import { setPendingIncomingCall } from "@/hooks/callStore";
import IncomingCallDialog from "@/components/messages/IncomingCallDialog";

/**
 * Rendered at the layout level. Listens for incoming calls globally
 * and shows the IncomingCallDialog popup regardless of current page.
 * On accept, navigates to the messages page so the user can pick up.
 */
export default function GlobalCallOverlay() {
  const { incomingCall, dismissCall, clearIncoming } = useGlobalCallListener();
  const { role } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAccept = () => {
    if (!incomingCall) return;

    const convId = incomingCall.conversationId;
    const callType = incomingCall.callType;

    // Store the incoming call in shared store so ChatView's useVideoCall can pick it up
    if (incomingCall.offer) {
      setPendingIncomingCall({
        callerId: incomingCall.callerId,
        callerName: incomingCall.callerName,
        callType: incomingCall.callType,
        conversationId: incomingCall.conversationId,
        offer: incomingCall.offer,
      });
    }

    // Clear the global incoming state — ChatView will retrieve from shared store
    clearIncoming();

    // Navigate to messages with query params so the chat view can auto-open and accept
    if (role === "doctor") {
      navigate(`/doctor/messages?call=${convId}&callType=${callType}&autoAccept=true`);
    } else {
      navigate(`/messages?call=${convId}&callType=${callType}&autoAccept=true`);
    }
  };

  // Show global overlay on ALL pages including messages pages
  // This ensures users see incoming calls even when on conversation list (no chat selected)

  return (
    <AnimatePresence>
      {incomingCall && (
        <IncomingCallDialog
          callerName={incomingCall.callerName}
          callType={incomingCall.callType}
          onAccept={handleAccept}
          onReject={dismissCall}
        />
      )}
    </AnimatePresence>
  );
}
