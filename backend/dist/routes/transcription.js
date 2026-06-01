"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transcriptionService_js_1 = require("../services/transcriptionService.js");
const router = (0, express_1.Router)();
router.post('/', (req, _res, next) => {
    if (Buffer.isBuffer(req.body)) {
        console.log(`[transcribe] received audio chunk (${req.body.length} bytes)`);
        next();
        return;
    }
    next(new Error('Transcription route expects raw audio bytes'));
}, async (req, res) => {
    const startedAt = Date.now();
    try {
        const audioBuffer = req.body;
        if (!audioBuffer?.length) {
            res.status(400).json({ error: 'Audio payload is empty' });
            return;
        }
        console.log('[transcribe] starting local Whisper transcription');
        const transcript = await (0, transcriptionService_js_1.transcribeAudioBuffer)(audioBuffer);
        console.log(`[transcribe] completed transcription (${transcript.length} characters) in ${Date.now() - startedAt}ms`);
        res.json({ text: transcript });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[transcribe]', message);
        res.status(502).json({ error: `Transcription failed: ${message}` });
    }
});
exports.default = router;
