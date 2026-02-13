import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Conversation {
  id: string;
  patient_id: string;
  doctor_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  /** The auth user_id of the doctor (resolved from doctors table) */
  doctor_user_id?: string | null;
  doctor?: {
    id: string;
    full_name: string;
    specialization: string;
    avatar_url: string | null;
    user_id?: string | null;
  };
  patient?: {
    full_name: string | null;
    user_id?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string;
  content: string;
  is_read: boolean;
  created_at: string;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
}

export interface CallLog {
  id: string;
  conversation_id: string;
  caller_id: string;
  call_type: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
}

export function useMessages(viewAs: "patient" | "doctor" = "patient") {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all conversations with related info
  const conversationsQuery = useQuery({
    queryKey: ["conversations", user?.id, viewAs],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("last_message_at", { ascending: false });
      if (error) throw error;

      const convs = data as any[];

      if (viewAs === "patient") {
        // Fetch doctor info
        const doctorIds = [...new Set(convs.map((c) => c.doctor_id))];
        if (doctorIds.length === 0) return [] as Conversation[];

        const { data: doctors } = await supabase
          .from("doctors")
          .select("id, full_name, specialization, avatar_url, user_id")
          .in("id", doctorIds);

        const doctorMap = new Map((doctors || []).map((d: any) => [d.id, d]));

        return convs.map((c) => {
          const doc = doctorMap.get(c.doctor_id);
          return {
            ...c,
            doctor: doc,
            doctor_user_id: doc?.user_id || null,
          };
        }) as Conversation[];
      } else {
        // Doctor view: fetch patient info
        const patientIds = [...new Set(convs.map((c) => c.patient_id))];
        if (patientIds.length === 0) return [] as Conversation[];

        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", patientIds);

        const patientMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

        return convs.map((c) => ({
          ...c,
          patient: patientMap.get(c.patient_id) || { full_name: "Patient" },
        })) as Conversation[];
      }
    },
  });

  // Fetch messages for a conversation
  const useConversationMessages = (conversationId: string | null) =>
    useQuery({
      queryKey: ["messages", conversationId],
      enabled: !!conversationId,
      queryFn: async () => {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId!)
          .order("created_at", { ascending: true });
        if (error) throw error;
        return data as Message[];
      },
    });

  // Fetch call logs for a conversation
  const useCallLogs = (conversationId: string | null) =>
    useQuery({
      queryKey: ["call-logs", conversationId],
      enabled: !!conversationId,
      queryFn: async () => {
        const { data, error } = await supabase
          .from("call_logs")
          .select("*")
          .eq("conversation_id", conversationId!)
          .order("started_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        return data as CallLog[];
      },
    });

  // Start or get existing conversation (patient only)
  const startConversation = useMutation({
    mutationFn: async (doctorId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .eq("patient_id", user.id)
        .eq("doctor_id", doctorId)
        .maybeSingle();

      if (existing) return existing as Conversation;

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          patient_id: user.id,
          doctor_id: doctorId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Send a message (with optional attachment)
  const sendMessage = useMutation({
    mutationFn: async ({
      conversationId,
      content,
      attachmentUrl,
      attachmentType,
      attachmentName,
      senderType,
    }: {
      conversationId: string;
      content: string;
      attachmentUrl?: string;
      attachmentType?: string;
      attachmentName?: string;
      senderType?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: senderType || viewAs,
          content,
          attachment_url: attachmentUrl || null,
          attachment_type: attachmentType || null,
          attachment_name: attachmentName || null,
        })
        .select()
        .single();

      if (error) throw error;

      const displayContent = attachmentName
        ? `📎 ${attachmentName}`
        : content;
      await supabase
        .from("conversations")
        .update({
          last_message: displayContent,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      return data as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Upload attachment to storage
  const uploadAttachment = useCallback(
    async (file: File, conversationId: string) => {
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${conversationId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("chat-attachments")
        .upload(path, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(path);

      return {
        url: urlData.publicUrl,
        type: file.type,
        name: file.name,
      };
    },
    [user]
  );

  // Log a call
  const logCall = useMutation({
    mutationFn: async (params: {
      conversationId: string;
      callType: string;
      status: string;
      durationSeconds?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("call_logs")
        .insert({
          conversation_id: params.conversationId,
          caller_id: user.id,
          call_type: params.callType,
          status: params.status,
          duration_seconds: params.durationSeconds || 0,
          ended_at: params.status !== "missed" ? new Date().toISOString() : null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as CallLog;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["call-logs", variables.conversationId] });
    },
  });

  // Real-time subscription for new messages
  const useRealtimeMessages = (conversationId: string | null) => {
    useEffect(() => {
      if (!conversationId) return;

      const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [conversationId]);
  };

  return {
    conversations: conversationsQuery.data || [],
    isConversationsLoading: conversationsQuery.isLoading,
    useConversationMessages,
    useCallLogs,
    startConversation,
    sendMessage,
    uploadAttachment,
    logCall,
    useRealtimeMessages,
  };
}
