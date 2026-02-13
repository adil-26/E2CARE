import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMessages, Conversation } from "@/hooks/useMessages";
import { useAppointments, Doctor } from "@/hooks/useAppointments";
import ConversationList from "@/components/messages/ConversationList";
import ChatView from "@/components/messages/ChatView";

export default function Messages() {
  const { conversations, isConversationsLoading, startConversation } = useMessages();
  const { doctors } = useAppointments();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-open conversation from incoming call navigation
  useEffect(() => {
    const callConvId = searchParams.get("call");
    if (callConvId && conversations.length > 0 && !activeConversation) {
      const conv = conversations.find((c) => c.id === callConvId);
      if (conv) {
        setActiveConversation(conv);
        // Clean up query params
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, conversations, activeConversation, setSearchParams]);

  const handleStartChat = async (doctor: Doctor) => {
    const conv = await startConversation.mutateAsync(doctor.id);
    setActiveConversation({
      ...conv,
      doctor: {
        id: doctor.id,
        full_name: doctor.full_name,
        specialization: doctor.specialization,
        avatar_url: doctor.avatar_url,
      },
    });
    setShowNewChat(false);
  };

  const filteredDoctors = doctorSearch.trim()
    ? doctors.filter(
        (d) =>
          d.full_name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
          d.specialization.toLowerCase().includes(doctorSearch.toLowerCase())
      )
    : doctors;

  if (isConversationsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Show chat view when a conversation is selected
  if (activeConversation) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)] flex flex-col"
      >
        <ChatView
          conversation={activeConversation}
          onBack={() => setActiveConversation(null)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">Messages</h2>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowNewChat(true)}>
          <Plus className="h-3.5 w-3.5" /> New Chat
        </Button>
      </div>

      {/* Conversations list */}
      <Card className="shadow-sm">
        <CardContent className="p-2 sm:p-3">
          <ConversationList
            conversations={conversations}
            activeId={null}
            onSelect={setActiveConversation}
          />
        </CardContent>
      </Card>

      {/* New chat dialog */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Start New Chat
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-10 text-sm"
                placeholder="Search doctors..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredDoctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleStartChat(doc)}
                  disabled={startConversation.isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-accent/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-accent/50 flex items-center justify-center text-lg flex-shrink-0">
                    🏥
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">{doc.full_name}</h4>
                    <p className="text-[10px] text-muted-foreground">{doc.specialization} · {doc.hospital}</p>
                  </div>
                </button>
              ))}
              {filteredDoctors.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No doctors found.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
