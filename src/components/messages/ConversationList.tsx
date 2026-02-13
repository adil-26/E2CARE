import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Conversation } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
}

const SPEC_ICONS: Record<string, string> = {
  "General Physician": "🩺",
  "Cardiologist": "❤️",
  "Dermatologist": "🧴",
  "Orthopedic Surgeon": "🦴",
  "Pediatrician": "👶",
  "ENT Specialist": "👂",
  "Gynecologist": "🩷",
  "Neurologist": "🧠",
};

export default function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
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
            // Add online users from this channel
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

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <span className="text-3xl mb-3">💬</span>
        <h3 className="font-semibold text-sm text-foreground">No Conversations</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Book an appointment with a doctor to start messaging them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const doc = conv.doctor;
        const isActive = conv.id === activeId;
        const specIcon = doc ? SPEC_ICONS[doc.specialization] || "🏥" : "🏥";
        const doctorUserId = conv.doctor_user_id || "";
        const isOnline = onlineUsers.has(doctorUserId);

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
              <div className="h-10 w-10 rounded-full bg-accent/50 flex items-center justify-center text-lg">
                {specIcon}
              </div>
              {/* Online indicator */}
              {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-medium text-sm truncate text-foreground">
                  {doc?.full_name || "Doctor"}
                </h4>
                {conv.last_message_at && (
                  <span className="text-[9px] text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">{doc?.specialization}</p>
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
