import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getPendingIncomingCall } from "@/hooks/callStore";
import { CallLogger } from "@/hooks/callLogger";

export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended";
export type CallingSubStatus = "calling" | "ringing";
export type CallType = "audio" | "video";

export interface IncomingCall {
  callerId: string;
  callerName: string;
  callType: CallType;
  conversationId: string;
  offer: RTCSessionDescriptionInit;
}

interface SignalPayload {
  type: "offer" | "answer" | "ice-candidate" | "call-end" | "call-reject" | "broadcast";
  event?: string;
  payload?: any;
  callerId: string;
  callerName: string;
  callType: CallType;
  conversationId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface CallState {
  status: CallStatus;
  callType: CallType;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  callerName: string;
  incomingCall: IncomingCall | null;
  connectionState: RTCIceConnectionState;
}

const rtcConfig: RTCConfiguration = {
  iceServers: [
    // STUN servers for NAT discovery
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
    // TURN servers for NAT traversal (Metered.ca Open Relay - 20GB free/month)
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "e2care-open-relay",
      credential: "openrelayprojectsecret",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "e2care-open-relay",
      credential: "openrelayprojectsecret",
    },
    {
      urls: "turn:global.relay.metered.ca:443?transport=tcp",
      username: "e2care-open-relay",
      credential: "openrelayprojectsecret",
    },
  ],
  iceCandidatePoolSize: 10,
};

export function useVideoCall(conversationId: string, remoteName: string) {
  const { user } = useAuth();
  const [state, setState] = useState<CallState>({
    status: "idle",
    callType: "audio",
    remoteStream: null,
    localStream: null,
    isMuted: false,
    isVideoOff: false,
    callDuration: 0,
    callerName: "",
    incomingCall: null,
    connectionState: "new",
  });

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);
  const isChannelReady = useRef(false);
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const pendingSignals = useRef<SignalPayload[]>([]);
  // Use the same channel name as useGlobalCallListener for consistency
  const channelName = `call-offer-notify:${conversationId}`;

  // Check for pending incoming call from shared store (set by GlobalCallOverlay)
  useEffect(() => {
    CallLogger.callEvent('Hook mounted', { conversationId, userId: user?.id }, conversationId);
    const pendingCall = getPendingIncomingCall(conversationId);
    if (pendingCall) {
      CallLogger.callEvent('Found pending call from store', { callerId: pendingCall.callerId, callType: pendingCall.callType }, conversationId);
      setState((s) => ({
        ...s,
        incomingCall: pendingCall,
      }));
    }
  }, [conversationId, user]);

  const sendSignal = useCallback(
    async (payload: any) => {
      if (!channelRef.current || !isChannelReady.current) {
        CallLogger.warn('Channel not ready, queuing signal', { type: payload.type }, conversationId);
        pendingSignals.current.push(payload);
        return;
      }
      CallLogger.signalSent(payload.type, conversationId, { targetChannel: channelName });
      await channelRef.current.send({
        type: "broadcast",
        event: "call-signal",
        payload: {
          callerId: user?.id,
          callerName: user?.user_metadata?.full_name || "User",
          ...payload,
        },
      });
    },
    [user, conversationId, channelName]
  );

  const flushPendingSignals = useCallback(() => {
    while (pendingSignals.current.length > 0) {
      const signal = pendingSignals.current.shift();
      if (signal) sendSignal(signal);
    }
  }, [sendSignal]);

  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    iceCandidateQueue.current = [];
  }, []);

  const createPeerConnection = useCallback((targetUserId: string) => {
    CallLogger.callEvent('Creating RTCPeerConnection', { targetUserId, iceServers: rtcConfig.iceServers?.length }, conversationId);
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnection.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        CallLogger.iceCandidate('sent', conversationId, { type: event.candidate.type, protocol: event.candidate.protocol });
        sendSignal({
          type: "ice-candidate",
          candidate: event.candidate,
          targetUserId,
          conversationId,
        });
      } else {
        CallLogger.debug('ICE gathering complete', undefined, conversationId);
      }
    };

    pc.ontrack = (event) => {
      CallLogger.mediaEvent('Remote track received', { kind: event.track?.kind, streams: event.streams?.length }, conversationId);
      if (event.streams && event.streams[0]) {
        setState((s) => ({ ...s, remoteStream: event.streams[0] }));
      }
    };

    pc.oniceconnectionstatechange = () => {
      const newState = pc.iceConnectionState;
      CallLogger.connectionState(newState, conversationId);
      setState((s) => ({ ...s, connectionState: newState }));

      if (newState === "disconnected" || newState === "failed") {
        CallLogger.error(`ICE ${newState}`, { signalingState: pc.signalingState }, conversationId);
        if (newState === "failed") {
          cleanupMedia();
          setState((s) => ({ ...s, status: "ended" }));
          setTimeout(() => {
            setState((s) => ({ ...s, status: "idle" }));
          }, 2000);
        }
      }
    };

    pc.onsignalingstatechange = () => {
      CallLogger.debug(`Signaling state: ${pc.signalingState}`, undefined, conversationId);
    };

    pc.onicegatheringstatechange = () => {
      CallLogger.debug(`ICE gathering state: ${pc.iceGatheringState}`, undefined, conversationId);
    };

    if (localStreamRef.current) {
      const localStream = localStreamRef.current;
      const tracks = localStream.getTracks();
      CallLogger.mediaEvent('Adding local tracks', { count: tracks.length, kinds: tracks.map(t => t.kind) }, conversationId);
      tracks.forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  }, [sendSignal, conversationId, cleanupMedia]);

  const broadcastOfferOnGlobalChannel = useCallback(
    async (callType: CallType, offer: RTCSessionDescriptionInit) => {
      if (!user) return;
      const globalCh = supabase.channel(`call-offer-notify:${conversationId}`);
      globalCh.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await globalCh.send({
            type: "broadcast",
            event: "call-signal",
            payload: {
              type: "offer",
              callerId: user.id,
              callerName: user.user_metadata?.full_name || "User",
              callType,
              conversationId,
              offer,
            },
          });
          console.log("[Call] Offer sent on global channel");
          setTimeout(() => supabase.removeChannel(globalCh), 3000);
        }
      });
    },
    [user, conversationId]
  );

  const startCall = useCallback(
    async (callType: CallType) => {
      if (!user) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });

        localStreamRef.current = stream;
        setState((s) => ({
          ...s,
          status: "calling",
          callType,
          localStream: stream,
          callerName: remoteName,
        }));

        const pc = createPeerConnection("");

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        sendSignal({
          type: "offer",
          callType,
          conversationId,
          offer,
        });

        broadcastOfferOnGlobalChannel(callType, offer);

        console.log("[Call] Inserting ringing call_log for DB-based notification");
        await supabase.from("call_logs").insert({
          conversation_id: conversationId,
          caller_id: user.id,
          call_type: callType,
          status: "ringing",
          duration_seconds: 0,
        });
      } catch (err) {
        console.error("Failed to start call:", err);
        cleanupMedia();
        setState((s) => ({ ...s, status: "idle" }));
      }
    },
    [user, remoteName, createPeerConnection, sendSignal, broadcastOfferOnGlobalChannel, conversationId, cleanupMedia]
  );

  const acceptCall = useCallback(async () => {
    const incoming = state.incomingCall;
    if (!incoming || !user) {
      CallLogger.warn('acceptCall called but no incomingCall or user', { hasIncoming: !!incoming, hasUser: !!user }, conversationId);
      return;
    }

    CallLogger.callEvent('ACCEPTING CALL', { callerId: incoming.callerId, callType: incoming.callType, hasOffer: !!incoming.offer }, conversationId);

    try {
      CallLogger.mediaEvent('Requesting user media', { audio: true, video: incoming.callType === "video" }, conversationId);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incoming.callType === "video",
      });
      CallLogger.mediaEvent('Got local stream', { tracks: stream.getTracks().map(t => t.kind) }, conversationId);

      localStreamRef.current = stream;
      setState((s) => ({
        ...s,
        status: "connected",
        callType: incoming.callType,
        localStream: stream,
        callerName: incoming.callerName,
        incomingCall: null,
        callDuration: 0,
      }));

      const pc = createPeerConnection(incoming.callerId);

      CallLogger.debug('Setting remote description (offer)', { type: incoming.offer.type }, conversationId);
      await pc.setRemoteDescription(new RTCSessionDescription(incoming.offer));
      CallLogger.debug('Remote description set successfully', undefined, conversationId);

      if (iceCandidateQueue.current.length > 0) {
        CallLogger.debug(`Processing ${iceCandidateQueue.current.length} queued ICE candidates`, undefined, conversationId);
        for (const candidate of iceCandidateQueue.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        iceCandidateQueue.current = [];
      }

      CallLogger.debug('Creating answer', undefined, conversationId);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      CallLogger.debug('Local description (answer) set', undefined, conversationId);

      CallLogger.signalSent('answer', conversationId, { callType: incoming.callType });
      sendSignal({
        type: "answer",
        callType: incoming.callType,
        conversationId,
        answer,
      });

      CallLogger.callEvent('CALL ACCEPTED - waiting for ICE to connect', undefined, conversationId);
      durationInterval.current = setInterval(() => {
        setState((s) => ({ ...s, callDuration: s.callDuration + 1 }));
      }, 1000);
    } catch (err: any) {
      CallLogger.error('FAILED TO ACCEPT CALL', { error: err?.message || String(err) }, conversationId);
      cleanupMedia();
      setState((s) => ({ ...s, status: "idle", incomingCall: null }));
    }
  }, [state.incomingCall, user, createPeerConnection, sendSignal, conversationId, cleanupMedia]);

  const rejectCall = useCallback(() => {
    sendSignal({
      type: "call-reject",
      callType: state.incomingCall?.callType || "audio",
      conversationId,
    });
    setState((s) => ({ ...s, incomingCall: null }));
  }, [sendSignal, state.incomingCall, conversationId]);

  const endCall = useCallback(() => {
    sendSignal({
      type: "call-end",
      callType: state.callType,
      conversationId,
    });
    cleanupMedia();
    setState((s) => ({
      ...s,
      status: "ended",
      remoteStream: null,
      localStream: null,
      callDuration: 0,
      incomingCall: null,
    }));

    setTimeout(() => {
      setState((s) => ({ ...s, status: "idle" }));
    }, 2000);
  }, [sendSignal, state.callType, conversationId, cleanupMedia]);

  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setState((s) => ({ ...s, isMuted: !s.isMuted }));
  }, []);

  const toggleVideo = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setState((s) => ({ ...s, isVideoOff: !s.isVideoOff }));
  }, []);

  // Use a stable ref to prevent multiple subscriptions on remount
  const isSubscribed = useRef(false);
  const subscriptionId = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    // Prevent duplicate subscriptions from React StrictMode / Fast Refresh
    const currentSubscriptionId = `${conversationId}-${Date.now()}`;
    if (isSubscribed.current) {
      CallLogger.debug('Already subscribed, skipping duplicate', { existing: subscriptionId.current }, conversationId);
      return;
    }

    isSubscribed.current = true;
    subscriptionId.current = currentSubscriptionId;
    isChannelReady.current = false;

    CallLogger.callEvent('Creating signaling channel', { channelName }, conversationId);

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false, ack: true },
        presence: { key: user.id },
      },
    });
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "call-signal" }, ({ payload }) => {
        const signal = payload as SignalPayload;
        if (signal.callerId === user.id) return;

        CallLogger.signalReceived(signal.type, conversationId, { from: signal.callerName, callType: signal.callType });

        switch (signal.type) {
          case "offer":
            CallLogger.callEvent('Incoming offer received', { callerId: signal.callerId, callType: signal.callType }, conversationId);
            setState((s) => ({
              ...s,
              incomingCall: {
                callerId: signal.callerId,
                callerName: signal.callerName,
                callType: signal.callType,
                conversationId: signal.conversationId,
                offer: signal.offer!,
              },
            }));
            break;

          case "answer":
            CallLogger.callEvent('Answer received, setting remote description', undefined, conversationId);
            if (peerConnection.current && signal.answer) {
              peerConnection.current
                .setRemoteDescription(new RTCSessionDescription(signal.answer))
                .then(() => {
                  CallLogger.debug('Remote description set from answer', undefined, conversationId);
                  for (const candidate of iceCandidateQueue.current) {
                    peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
                  }
                  iceCandidateQueue.current = [];
                  setState((s) => ({ ...s, status: "connected", callDuration: 0 }));
                  if (durationInterval.current) clearInterval(durationInterval.current);
                  durationInterval.current = setInterval(() => {
                    setState((s) => ({ ...s, callDuration: s.callDuration + 1 }));
                  }, 1000);
                })
                .catch((err) => {
                  CallLogger.error('Failed to set remote description', { error: String(err) }, conversationId);
                });
            }
            break;

          case "ice-candidate":
            if (signal.candidate) {
              CallLogger.iceCandidate('received', conversationId, { type: signal.candidate.type });
              if (peerConnection.current?.remoteDescription) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.candidate))
                  .catch((err) => CallLogger.warn('Failed to add ICE candidate', { error: String(err) }, conversationId));
              } else {
                iceCandidateQueue.current.push(signal.candidate);
              }
            }
            break;

          case "call-end":
          case "call-reject":
            CallLogger.callEvent(`Call ${signal.type}`, undefined, conversationId);
            cleanupMedia();
            setState((s) => ({
              ...s,
              status: signal.type === "call-end" ? "ended" : "idle",
              remoteStream: null,
              localStream: null,
              callDuration: 0,
              incomingCall: null,
            }));
            if (signal.type === "call-end") {
              setTimeout(() => {
                setState((s) => ({ ...s, status: "idle" }));
              }, 2000);
            }
            break;
        }
      });

    // Subscribe with async handling
    const subscribeAsync = async () => {
      try {
        const status = await channel.subscribe((status) => {
          CallLogger.info(`Channel subscription: ${status}`, { channel: channelName }, conversationId);
          if (status === "SUBSCRIBED") {
            isChannelReady.current = true;
            CallLogger.callEvent('✅ Channel ready for signaling', { pending: pendingSignals.current.length }, conversationId);
            flushPendingSignals();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            CallLogger.error(`Channel ${status}`, { channel: channelName }, conversationId);
            isChannelReady.current = false;
            // Retry subscription after a short delay
            setTimeout(() => {
              if (channelRef.current === channel) {
                CallLogger.info('Retrying channel subscription...', undefined, conversationId);
                channel.subscribe();
              }
            }, 2000);
          } else if (status === "CLOSED") {
            isChannelReady.current = false;
          }
        });
      } catch (err) {
        CallLogger.error('Channel subscription failed', { error: String(err) }, conversationId);
      }
    };

    subscribeAsync();

    return () => {
      CallLogger.callEvent('Cleaning up signaling channel', { channelName }, conversationId);
      isSubscribed.current = false;
      isChannelReady.current = false;
      subscriptionId.current = null;
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        // Ignore cleanup errors
      }
      channelRef.current = null;
    };
  }, [conversationId, user?.id, channelName, cleanupMedia, flushPendingSignals]);

  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, [cleanupMedia]);

  return {
    ...state,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
