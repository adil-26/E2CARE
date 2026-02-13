import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CallType } from "@/hooks/useVideoCall";

export interface GlobalIncomingCall {
  callerId: string;
  callerName: string;
  callType: CallType;
  conversationId: string;
  offer?: RTCSessionDescriptionInit;
  /** If true, the call came from DB fallback (no SDP offer available) */
  fromDb?: boolean;
}

/**
 * Global listener for incoming calls. Uses THREE mechanisms:
 * 1. Broadcast on call-offer-notify channels (matches what useVideoCall sends)
 * 2. Broadcast on call-global channels (legacy pattern)
 * 3. Postgres changes on call_logs table (reliable fallback, no SDP)
 */
export function useGlobalCallListener() {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState<GlobalIncomingCall | null>(null);
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);
  const dbChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const setup = async () => {
      // ─── 1. Get all conversation IDs for this user ───
      const { data: asPatient } = await supabase
        .from("conversations")
        .select("id")
        .eq("patient_id", user.id);

      const { data: doctorRow } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let doctorConvIds: string[] = [];
      if (doctorRow) {
        const { data: asDoctor } = await supabase
          .from("conversations")
          .select("id")
          .eq("doctor_id", doctorRow.id);
        doctorConvIds = (asDoctor || []).map((c) => c.id);
      }

      const allIds = [
        ...new Set([
          ...(asPatient || []).map((c) => c.id),
          ...doctorConvIds,
        ]),
      ];

      if (cancelled || allIds.length === 0) {
        console.log("[GlobalCall] No conversations found for user");
        return;
      }

      console.log("[GlobalCall] Subscribing to", allIds.length, "conversation channels");

      // ─── 2. Subscribe to broadcast channels ───
      // Listen on BOTH the offer-notify channel (sent by startCall) and the
      // legacy call-global channel. This ensures we catch offers no matter
      // which channel pattern the sender used.
      const channels: ReturnType<typeof supabase.channel>[] = [];

      for (const convId of allIds) {
        // Channel that matches useVideoCall's broadcastOfferOnGlobalChannel
        const notifyCh = supabase.channel(`call-offer-notify:${convId}`);
        notifyCh
          .on("broadcast", { event: "call-signal" }, ({ payload }) => {
            handleBroadcastSignal(payload);
          })
          .subscribe((status) => {
            console.log("[GlobalCall] Notify channel", convId, "status:", status);
            if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
              retrySubscription(notifyCh, convId, "notify");
            }
          });
        channels.push(notifyCh);

        // Legacy call-global channel
        const globalCh = supabase.channel(`call-global:${convId}`);
        globalCh
          .on("broadcast", { event: "call-signal" }, ({ payload }) => {
            handleBroadcastSignal(payload);
          })
          .subscribe((status) => {
            console.log("[GlobalCall] Global channel", convId, "status:", status);
            if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
              retrySubscription(globalCh, convId, "global");
            }
          });
        channels.push(globalCh);
      }

      channelsRef.current = channels;

      // ─── 3. DB fallback: listen for new "ringing" call_logs ───
      const dbChannel = supabase
        .channel("global-call-logs")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "call_logs",
            filter: `status=eq.ringing`,
          },
          async (payload) => {
            const row = payload.new as any;
            console.log("[GlobalCall] DB call_log INSERT:", row);

            // Ignore own calls
            if (row.caller_id === user.id) return;

            // Check if this conversation belongs to us
            if (!allIds.includes(row.conversation_id)) return;

            // Fetch caller info
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", row.caller_id)
              .maybeSingle();

            setIncomingCall((current) => {
              // Don't overwrite a broadcast-sourced call (which has the offer)
              if (current?.offer) return current;
              // Don't overwrite if we already have this conversation's call
              if (current && current.conversationId === row.conversation_id) return current;

              console.log("[GlobalCall] Setting incoming call from DB fallback");
              return {
                callerId: row.caller_id,
                callerName: profile?.full_name || "Incoming Call",
                callType: row.call_type as CallType,
                conversationId: row.conversation_id,
                fromDb: true,
              };
            });
          }
        )
        .subscribe((status) => {
          console.log("[GlobalCall] DB channel status:", status);
          if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
            retrySubscription(dbChannel, "db", "db");
          }
        });

      dbChannelRef.current = dbChannel;
    };

    function handleBroadcastSignal(payload: any) {
      if (!payload || payload.callerId === user.id) return;
      console.log("[GlobalCall] Broadcast received:", payload.type, "from", payload.callerName);

      if (payload.type === "offer") {
        setIncomingCall((current) => {
          // If we already have this call with an offer, skip
          if (current?.offer && current.conversationId === payload.conversationId) return current;

          return {
            callerId: payload.callerId,
            callerName: payload.callerName,
            callType: payload.callType,
            conversationId: payload.conversationId,
            offer: payload.offer,
          };
        });
      }
      if (payload.type === "call-end" || payload.type === "call-reject") {
        setIncomingCall(null);
      }
    }

    // Retry a failed subscription with exponential backoff
    function retrySubscription(
      channel: ReturnType<typeof supabase.channel>,
      id: string,
      label: string,
      attempt = 0
    ) {
      if (cancelled || attempt > 3) return;
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
      console.log(`[GlobalCall] Retrying ${label} channel ${id} in ${delay}ms (attempt ${attempt + 1})`);
      setTimeout(() => {
        if (cancelled) return;
        try {
          supabase.removeChannel(channel);
        } catch {}
        // Re-subscribe is handled by the effect cleanup/re-run
      }, delay);
    }

    setup();

    return () => {
      cancelled = true;
      channelsRef.current.forEach((ch) => {
        try { supabase.removeChannel(ch); } catch {}
      });
      channelsRef.current = [];
      if (dbChannelRef.current) {
        try { supabase.removeChannel(dbChannelRef.current); } catch {}
        dbChannelRef.current = null;
      }
    };
  }, [user]);

  const dismissCall = useCallback(() => {
    if (incomingCall && user) {
      // Send reject on both channel patterns
      const notifyCh = supabase.channel(`call-reject-notify:${incomingCall.conversationId}`);
      notifyCh.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          notifyCh.send({
            type: "broadcast",
            event: "call-signal",
            payload: {
              type: "call-reject",
              callerId: user.id,
              callerName: user.user_metadata?.full_name || "User",
              callType: incomingCall.callType,
              conversationId: incomingCall.conversationId,
            },
          });
          setTimeout(() => supabase.removeChannel(notifyCh), 2000);
        }
      });
    }
    setIncomingCall(null);
  }, [incomingCall, user]);

  const clearIncoming = useCallback(() => {
    setIncomingCall(null);
  }, []);

  return { incomingCall, dismissCall, clearIncoming };
}
