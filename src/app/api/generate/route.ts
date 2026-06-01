// /api/generate — Magic Hour API (LTX-2.3, free tier)
//
// Magic Hour is async: you create a job, then poll until it's complete.
// Free tier uses ltx-2.3 at 480p by default.
//
// Requires MAGIC_HOUR_API_KEY in .env.local
// Get your free key at: https://magichour.ai/settings/developer

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import type { GenerateRequest, GenerateResponse, VideoResult } from "@/types";

const BASE_URL = "https://api.magichour.ai";

async function createJob(prompt: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/v1/text-to-video`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.MAGIC_HOUR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      end_seconds: 5,
      aspect_ratio: "16:9",
      model: "default", // free tier gets ltx-2.3 automatically
      style: { prompt },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Job creation failed: ${res.status}`);
  }

  const data = await res.json();
  return data.id as string;
}

async function pollJob(jobId: string, maxWaitMs = 180_000): Promise<string> {
  const deadline = Date.now() + maxWaitMs;
  const INTERVAL = 4000;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, INTERVAL));

    const res = await fetch(`${BASE_URL}/v1/video-projects/${jobId}`, {
      headers: { "Authorization": `Bearer ${process.env.MAGIC_HOUR_API_KEY}` },
    });

    if (!res.ok) continue;

    const data = await res.json();
    const status: string = data.status;

    if (status === "complete") {
      const url: string = data.downloads?.[0]?.url;
      if (!url) throw new Error("Job complete but no download URL found.");
      return url;
    }

    if (status === "error" || status === "cancelled") {
      throw new Error(`Job ended with status: ${status}`);
    }

    // statuses: queued | rendering | complete | error | cancelled
    // keep polling for queued / rendering
  }

  throw new Error("Video generation timed out after 3 minutes.");
}

export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body: GenerateRequest = await req.json();

    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "prompt is required." },
        { status: 400 }
      );
    }

    const trimmed = body.prompt.trim();

    // Step 1 — create the job
    const jobId = await createJob(trimmed);
    console.log(`[/api/generate] Job created: ${jobId}`);

    // Step 2 — poll until done (max 3 mins)
    const videoUrl = await pollJob(jobId);
    console.log(`[/api/generate] Job complete: ${videoUrl}`);

    const video: VideoResult = {
      id: randomUUID(),
      url: videoUrl,
      prompt: trimmed,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, video });
  } catch (err) {
    console.error("[/api/generate] Error:", err);
    const message = err instanceof Error ? err.message : "Video generation failed.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
