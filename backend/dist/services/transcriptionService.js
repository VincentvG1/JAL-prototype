"use strict";
// Uses OpenAI Whisper API for transcription (whisper-1 model).
// The same OPENAI_API_KEY from backend/.env is reused — no extra config needed.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeAudioBuffer = transcribeAudioBuffer;
const node_fs_1 = require("node:fs");
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'YOUR_API_KEY_HERE';
const WHISPER_LANGUAGE = process.env.WHISPER_LANGUAGE ?? 'nl';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';
async function transcribeAudioBuffer(audioBuffer) {
    // Write buffer to a temp file so it can be sent as a multipart upload
    const tmpFile = node_path_1.default.join(node_os_1.default.tmpdir(), `jal-audio-${Date.now()}.webm`);
    await node_fs_1.promises.writeFile(tmpFile, audioBuffer);
    try {
        const fileBytes = await node_fs_1.promises.readFile(tmpFile);
        const blob = new Blob([fileBytes], { type: 'audio/webm' });
        const form = new FormData();
        form.append('file', blob, 'audio.webm');
        form.append('model', 'whisper-1');
        form.append('language', WHISPER_LANGUAGE);
        // Do NOT set Content-Type manually — fetch adds the multipart boundary automatically
        const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
            body: form,
        });
        if (!response.ok) {
            const raw = await response.text().catch(() => '');
            throw new Error(`OpenAI Whisper returned HTTP ${response.status}: ${raw.slice(0, 300)}`);
        }
        const data = (await response.json());
        return data.text;
    }
    finally {
        await node_fs_1.promises.unlink(tmpFile).catch(() => { });
    }
}
