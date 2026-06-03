import type { VideoResult } from '../../types/video';

interface VideoPlayerProps {
  video: VideoResult;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export function VideoPlayer({ video, onRegenerate, isGenerating }: VideoPlayerProps) {
  const timestamp = new Date(video.createdAt).toLocaleString();

  return (
    <section className="solution-video-card">
      <div className="solution-video-frame">
        <video
          key={video.url}
          src={video.url}
          controls
          autoPlay
          muted
          playsInline
          preload="auto"
          className="solution-video"
        />
      </div>

      <div className="solution-video-meta">
        <p className="solution-video-label">Prompt gebruikt</p>
        <p className="solution-video-prompt">"{video.prompt}"</p>

        <div className="solution-video-actions">
          <span className="solution-video-time">{timestamp}</span>
          <div className="solution-video-btns">
            <a href={video.url} download={`jal-video-${video.id}.mp4`} className="solution-secondary-btn">
              Download
            </a>
            <button className="solution-secondary-btn" onClick={onRegenerate} disabled={isGenerating}>
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
