import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Conversation } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DoctorConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export default function DoctorConversationList({ conversations, activeId, onSelect }: DoctorConversationListProps) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Subscribe to presence for all conversation channels
  useEffect(() => {
    if (!user || conversations.length === 0) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    conversations.forEach((conv) => {
      const channel = supabase.channel(`presence:${conv.id}`);
      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const ids = new Set<string>();
          Object.values(state).forEach((presences: any[]) => {
            presences.forEach((p) => {
              if (p.user_id && p.user_id !== user.id) ids.add(p.user_id);
            });
          });
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            ids.forEach((id) => newSet.add(id));
            return newSet;
          });
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
          }
        });
      channels.push(channel);
    });

    return () => {
      channels.forEach((ch) => {
        try {
          ch.untrack();
          supabase.removeChannel(ch);
        } catch { }
      });
    };
  }, [user, conversations]);

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const patient = conv.patient;
        const isActive = conv.id === activeId;
        const patientUserId = conv.patient_id || "";
        const isOnline = onlineUsers.has(patientUserId);

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${isActive
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-accent/50"
              }`}
          >
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-accent/50 flex items-center justify-center text-sm font-medium text-foreground">
                {(patient?.full_name || "P").charAt(0).toUpperCase()}
              </div>
              {/* Online indicator */}
              {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-medium text-sm truncate text-foreground">
                  {patient?.full_name || "Patient"}
                </h4>
                {conv.last_message_at && (
                  <span className="text-[9px] text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                  </span>
                )}
              </div>
              {conv.last_message && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {conv.last_message}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
