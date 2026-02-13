/**
 * Shared store for pending incoming calls.
 * Used to pass the incoming call offer from GlobalCallOverlay to ChatView.
 */

import { CallType, IncomingCall } from "./useVideoCall";

// Simple in-memory store for pending calls
let pendingIncomingCall: IncomingCall | null = null;

export function setPendingIncomingCall(call: IncomingCall | null) {
    pendingIncomingCall = call;
    console.log("[CallStore] Set pending incoming call:", call?.conversationId);
}

export function getPendingIncomingCall(conversationId: string): IncomingCall | null {
    if (pendingIncomingCall && pendingIncomingCall.conversationId === conversationId) {
        const call = pendingIncomingCall;
        pendingIncomingCall = null; // Clear after retrieval
        console.log("[CallStore] Retrieved pending incoming call:", call.conversationId);
        return call;
    }
    return null;
}

export function clearPendingIncomingCall() {
    pendingIncomingCall = null;
}
