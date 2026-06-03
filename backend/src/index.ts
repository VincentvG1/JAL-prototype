import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import aiRouter from './routes/ai.js';
import transcriptionRouter from './routes/transcription.js';
import chatRouter from './routes/chat.js';
import videoRouter from './routes/video.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/ai', aiRouter);
app.use('/api/chat', chatRouter);
app.use('/api/video', videoRouter);
app.use('/api/transcribe', express.raw({ type: ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg', 'audio/ogg;codecs=opus', 'application/octet-stream'], limit: '50mb' }), transcriptionRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler — must have 4 params for Express to treat it as error middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Expecting Ollama at ${process.env.OLLAMA_URL ?? 'http://localhost:11434'}`);
});
