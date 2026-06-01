import argparse
import json
import sys
import time

from faster_whisper import WhisperModel


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Transcribe audio with local Whisper')
    parser.add_argument('--audio', required=True, help='Path to an audio file')
    parser.add_argument('--model', default='large-v3', help='Whisper model name')
    parser.add_argument('--language', default='nl', help='Transcription language code')
    parser.add_argument('--device', default='cpu', help='Inference device')
    parser.add_argument('--compute-type', default='int8', help='Compute type for faster-whisper')
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    started_at = time.time()

    try:
        sys.stderr.write(f"loading Whisper model {args.model} on {args.device}\n")
        sys.stderr.flush()
        model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)
        sys.stderr.write('model loaded, starting transcription\n')
        sys.stderr.flush()
        segments, _info = model.transcribe(
            args.audio,
            language=args.language,
            task='transcribe',
            vad_filter=True,
        )

        transcript = ' '.join(segment.text.strip() for segment in segments if segment.text.strip()).strip()
        sys.stderr.write(
            f"transcription finished in {round((time.time() - started_at) * 1000)}ms, output chars={len(transcript)}\n"
        )
        sys.stderr.flush()
        sys.stdout.write(json.dumps({'text': transcript}))
        return 0
    except Exception as exc:
        sys.stderr.write(str(exc))
        return 1


if __name__ == '__main__':
    raise SystemExit(main())