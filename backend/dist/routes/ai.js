"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contextManager_js_1 = require("../services/contextManager.js");
const promptBuilder_js_1 = require("../services/promptBuilder.js");
const ollamaClient_js_1 = require("../services/ollamaClient.js");
const router = (0, express_1.Router)();
router.post('/process', async (req, res) => {
    const { text, sessionId } = req.body;
    if (!text?.trim() || !sessionId?.trim()) {
        res.status(400).json({ error: '`text` and `sessionId` are required' });
        return;
    }
    try {
        const session = (0, contextManager_js_1.getSession)(sessionId);
        console.log(`[ai/process] starting insight extraction for session ${sessionId}`);
        const systemPrompt = (0, promptBuilder_js_1.buildSystemPrompt)(session);
        const result = await (0, ollamaClient_js_1.callOllama)(systemPrompt, text.trim());
        const rollingSummary = typeof result.rollingSummary === 'string' ? result.rollingSummary.trim() : '';
        const snippets = Array.isArray(result.snippets)
            ? result.snippets.filter((s) => typeof s === 'string').map(s => s.trim()).filter(Boolean)
            : [];
        const nextQuestions = Array.isArray(result.nextQuestions)
            ? result.nextQuestions.filter((q) => typeof q === 'string').map(q => q.trim()).filter(Boolean)
            : [];
        console.log(`[ai/process] insights complete (${snippets.length} snippets, ${nextQuestions.length} questions)`);
        (0, contextManager_js_1.updateSession)(sessionId, text.trim(), rollingSummary, snippets, nextQuestions);
        res.json({
            rollingSummary,
            snippets,
            nextQuestions,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[ai/process]', message);
        res.status(502).json({ error: `AI request failed: ${message}` });
    }
});
router.delete('/session/:sessionId', (req, res) => {
    (0, contextManager_js_1.clearSession)(req.params.sessionId);
    res.json({ ok: true });
});
exports.default = router;
