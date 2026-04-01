'use client';

/*
 * SETUP — run once before using this component
 * ─────────────────────────────────────────────
 * 1. Install dependency (already done if you see this file in the repo):
 *      npm install face-api.js
 *
 * 2. Download the tiny face detector model weights into public/models/:
 *
 *    mkdir -p public/models
 *
 *    curl -L -o public/models/tiny_face_detector_model-weights_manifest.json \
 *      "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json"
 *
 *    curl -L -o public/models/tiny_face_detector_model-shard1 \
 *      "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1"
 *
 * Total model size: ~190 KB. No server calls are made; all inference runs in the browser.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'loading' | 'scanning' | 'detected' | 'complete' | 'timeout';

const STATUS_TEXT: Record<Status, string> = {
  idle: 'Initializing...',
  loading: 'Loading biometric module...',
  scanning: 'Scanning for human face...',
  detected: 'Face detected.',
  complete: 'Verification complete.',
  timeout: 'No face detected.',
};

interface Props {
  onComplete: (score: number) => void;
}

export default function WebcamCheck({ onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runningRef = useRef(false);

  const [status, setStatus] = useState<Status>('idle');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const stopAll = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    stopAll();
    setPermissionDenied(false);
    setStatus('idle');
    runningRef.current = true;

    // Dynamic import keeps face-api.js out of the server bundle
    let faceapi: typeof import('face-api.js');
    try {
      faceapi = await import('face-api.js');
    } catch (e) {
      console.error('[WebcamCheck] Failed to import face-api.js:', e);
      return;
    }

    if (!runningRef.current) return;
    setStatus('loading');

    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    } catch (e) {
      console.error('[WebcamCheck] Failed to load model weights. Did you download them into public/models/?', e);
      return;
    }

    if (!runningRef.current) return;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
    } catch {
      setPermissionDenied(true);
      return;
    }

    if (!runningRef.current) {
      stream.getTracks().forEach(t => t.stop());
      return;
    }

    streamRef.current = stream;
    const video = videoRef.current!;
    video.srcObject = stream;
    await video.play();

    setStatus('scanning');

    // 10-second hard timeout
    timeoutRef.current = setTimeout(() => {
      if (!runningRef.current) return;
      cancelAnimationFrame(rafRef.current);
      setStatus('timeout');
    }, 10_000);

    const detect = async () => {
      if (!runningRef.current || !video || video.paused || video.ended) return;

      const result = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }),
      );

      if (!runningRef.current) return;

      if (result) {
        clearTimeout(timeoutRef.current!);
        setStatus('detected');

        // Brief pause for gravitas, then finalize
        setTimeout(() => {
          if (!runningRef.current) return;
          setStatus('complete');
          const score = Math.floor(Math.random() * 41) + 60; // 60–100
          setTimeout(() => {
            stopAll();
            onComplete(score);
          }, 1_000);
        }, 900);

        return; // stop detection loop
      }

      rafRef.current = requestAnimationFrame(() => void detect());
    };

    rafRef.current = requestAnimationFrame(() => void detect());
  }, [onComplete, stopAll]);

  useEffect(() => {
    start();
    return stopAll;
  }, [start, stopAll]);

  const isTimedOut = status === 'timeout';

  const statusColor =
    status === 'timeout'
      ? 'text-red-700'
      : status === 'detected' || status === 'complete'
        ? 'text-green-700'
        : 'text-ink';

  return (
    <div className="font-mono select-none">
      <div className="border-2 border-ink p-4 max-w-[420px] bg-white">

        {/* Header */}
        <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-ink mb-3">
          Biometric Scan in Progress
        </p>

        {/* Camera viewport */}
        <div className="relative bg-[#0a0a0a] aspect-[4/3] overflow-hidden">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover block"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Corner markers while scanning */}
          {status === 'scanning' && (
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-2.5 left-2.5 w-4 h-4 border-t border-l border-white/50" />
              <span className="absolute top-2.5 right-2.5 w-4 h-4 border-t border-r border-white/50" />
              <span className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b border-l border-white/50" />
              <span className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b border-r border-white/50" />
            </div>
          )}

          {/* Green confirmation border */}
          {(status === 'detected' || status === 'complete') && (
            <div className="absolute inset-0 border-[3px] border-green-600 pointer-events-none" />
          )}
        </div>

        {/* Live status */}
        <p className={`mt-2.5 text-[11px] tracking-wide min-h-4 ${statusColor}`}>
          {STATUS_TEXT[status]}
        </p>

        {/* Look-at-camera prompt */}
        {status === 'scanning' && (
          <p className="mt-1 text-[10px] text-zinc-500 tracking-wide">
            Look directly at the camera.
          </p>
        )}

        {/* Timeout + retry */}
        {isTimedOut && (
          <div className="mt-3">
            <p className="text-[10px] text-zinc-500 tracking-wide mb-2.5">
              No face detected — are you perhaps a bot?
            </p>
            <button
              onClick={start}
              className="border border-ink bg-transparent px-3.5 py-1.5 text-[10px] tracking-[0.1em] uppercase cursor-pointer hover:bg-ink hover:text-white transition-colors"
            >
              Retry scan
            </button>
          </div>
        )}

        {/* Camera permission denied */}
        {permissionDenied && (
          <p className="mt-2.5 text-[10px] text-red-700 tracking-wide">
            Camera access denied. This certification requires a face.
          </p>
        )}
      </div>
    </div>
  );
}
