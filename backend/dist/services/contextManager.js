"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = getSession;
exports.updateSession = updateSession;
exports.clearSession = clearSession;
const MAX_HISTORY_TURNS = 20;
const sessions = new Map();
function getSession(sessionId) {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
            history: [],
            rollingSummary: 'No summary yet.',
            snippets: [],
            nextQuestions: [],
        });
    }
    return sessions.get(sessionId);
}
function updateSession(sessionId, userInput, rollingSummary, snippets, nextQuestions) {
    const session = getSession(sessionId);
    session.history.push({ userInput, snippets, timestamp: Date.now() });
    // Rolling window — prevent unbounded context growth
    if (session.history.length > MAX_HISTORY_TURNS) {
        session.history.shift();
    }
    session.rollingSummary = rollingSummary;
    session.snippets = snippets;
    session.nextQuestions = nextQuestions;
}
function clearSession(sessionId) {
    sessions.delete(sessionId);
}
