"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ai_js_1 = __importDefault(require("./routes/ai.js"));
const transcription_js_1 = __importDefault(require("./routes/transcription.js"));
const chat_js_1 = __importDefault(require("./routes/chat.js"));
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3001;
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express_1.default.json());
app.use('/api/ai', ai_js_1.default);
app.use('/api/chat', chat_js_1.default);
app.use('/api/transcribe', express_1.default.raw({ type: ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg', 'audio/ogg;codecs=opus', 'application/octet-stream'], limit: '50mb' }), transcription_js_1.default);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Global error handler — must have 4 params for Express to treat it as error middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('[error]', err.message);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log(`Expecting Ollama at ${process.env.OLLAMA_URL ?? 'http://localhost:11434'}`);
});
