/**
 * Call Logger - Comprehensive debugging for WebRTC calls
 * All logs are visible in browser console with [CallLog] prefix
 * 
 * To view logs: Open browser DevTools > Console > Filter by "CallLog"
 */

export interface CallLogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    event: string;
    details?: any;
    conversationId?: string;
}

// Store logs in memory for export
const logHistory: CallLogEntry[] = [];
const MAX_LOG_ENTRIES = 500;

function getTimestamp(): string {
    return new Date().toISOString();
}

function formatLog(entry: CallLogEntry): string {
    const details = entry.details ? ` | ${JSON.stringify(entry.details)}` : '';
    const convId = entry.conversationId ? ` [Conv:${entry.conversationId.slice(0, 8)}...]` : '';
    return `[CallLog]${convId} ${entry.level}: ${entry.event}${details}`;
}

function addToHistory(entry: CallLogEntry) {
    logHistory.push(entry);
    if (logHistory.length > MAX_LOG_ENTRIES) {
        logHistory.shift();
    }
}

export const CallLogger = {
    info(event: string, details?: any, conversationId?: string) {
        const entry: CallLogEntry = { timestamp: getTimestamp(), level: 'INFO', event, details, conversationId };
        addToHistory(entry);
        console.log(`%c${formatLog(entry)}`, 'color: #2196F3');
    },

    warn(event: string, details?: any, conversationId?: string) {
        const entry: CallLogEntry = { timestamp: getTimestamp(), level: 'WARN', event, details, conversationId };
        addToHistory(entry);
        console.warn(`%c${formatLog(entry)}`, 'color: #FF9800');
    },

    error(event: string, details?: any, conversationId?: string) {
        const entry: CallLogEntry = { timestamp: getTimestamp(), level: 'ERROR', event, details, conversationId };
        addToHistory(entry);
        console.error(`%c${formatLog(entry)}`, 'color: #F44336');
    },

    debug(event: string, details?: any, conversationId?: string) {
        const entry: CallLogEntry = { timestamp: getTimestamp(), level: 'DEBUG', event, details, conversationId };
        addToHistory(entry);
        console.log(`%c${formatLog(entry)}`, 'color: #9E9E9E');
    },

    // Signal-specific helpers
    signalSent(type: string, conversationId: string, details?: any) {
        this.info(`📤 SIGNAL SENT: ${type}`, details, conversationId);
    },

    signalReceived(type: string, conversationId: string, details?: any) {
        this.info(`📥 SIGNAL RECEIVED: ${type}`, details, conversationId);
    },

    iceCandidate(direction: 'sent' | 'received', conversationId: string, candidate?: any) {
        const emoji = direction === 'sent' ? '🧊→' : '←🧊';
        this.debug(`${emoji} ICE candidate ${direction}`, { type: candidate?.type }, conversationId);
    },

    connectionState(state: string, conversationId: string) {
        const emoji = state === 'connected' ? '✅' : state === 'failed' ? '❌' : '🔄';
        this.info(`${emoji} ICE Connection: ${state}`, undefined, conversationId);
    },

    mediaEvent(event: string, details?: any, conversationId?: string) {
        this.info(`🎥 MEDIA: ${event}`, details, conversationId);
    },

    callEvent(event: string, details?: any, conversationId?: string) {
        this.info(`📞 CALL: ${event}`, details, conversationId);
    },

    // Export all logs as JSON for debugging
    exportLogs(): string {
        return JSON.stringify(logHistory, null, 2);
    },

    // Get recent logs
    getRecentLogs(count: number = 50): CallLogEntry[] {
        return logHistory.slice(-count);
    },

    // Print summary to console
    printSummary() {
        console.log('%c=== CALL LOG SUMMARY ===', 'font-weight: bold; font-size: 14px');
        console.log(`Total entries: ${logHistory.length}`);
        console.log('Recent logs:', this.getRecentLogs(20));
    }
};

// Expose to window for debugging in console
if (typeof window !== 'undefined') {
    (window as any).CallLogger = CallLogger;
}
