import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMessages, Conversation } from "@/hooks/useMessages";
import DoctorConversationList from "@/components/messages/DoctorConversationList";
import DoctorChatView from "@/components/messages/DoctorChatView";

export default function DoctorMessages() {
  const { conversations, isConversationsLoading } = useMessages("doctor");
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-open conversation from incoming call navigation
  useEffect(() => {
    const callConvId = searchParams.get("call");
    if (callConvId && conversations.length > 0 && !activeConversation) {
      const conv = conversations.find((c) => c.id === callConvId);
      if (conv) {
        setActiveConversation(conv);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, conversations, activeConversation, setSearchParams]);

  if (isConversationsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (activeConversation) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)] flex flex-col"
      >
        <DoctorChatView
          conversation={activeConversation}
          onBack={() => setActiveConversation(null)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">Patient Messages</h2>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-2 sm:p-3">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-sm text-foreground">No Messages Yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                When patients message you, their conversations will appear here.
              </p>
            </div>
          ) : (
            <DoctorConversationList
              conversations={conversations}
              activeId={null}
              onSelect={setActiveConversation}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
