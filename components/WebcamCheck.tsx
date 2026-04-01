'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'loading' | 'scanning' | 'tracking' | 'complete' | 'timeout';

const STATUS_TEXT: Record<Status, string> = {
  idle: 'Initializing...',
  loading: 'Loading biometric module...',
  scanning: 'Establishing face lock...',
  tracking: 'Biometric liveness check: Follow the dot.',
  complete: 'Liveness verified.',
  timeout: 'Session timeout.',
};

interface Props {
  onComplete: (score: number, imageUrl: string) => void;
}

// Target positions for the dot (in % of viewport)
const TARGET_STEPS = [
  { x: 20, y: 20, label: 'Top-Left' },
  { x: 80, y: 80, label: 'Bottom-Right' },
  { x: 50, y: 50, label: 'Center' },
];

export default function WebcamCheck({ onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runningRef = useRef(false);

  const [status, setStatus] = useState<Status>('idle');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0); // 0 to 100
  const [dotPos, setDotPos] = useState({ x: 50, y: 50 });
  const [facePosition, setFacePosition] = useState<{ x: number; y: number } | null>(null);

  const stopAll = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const finalize = useCallback((score: number, imageUrl: string) => {
    setStatus('complete');
    setTimeout(() => {
      stopAll();
      onComplete(score, imageUrl);
    }, 1200);
  }, [onComplete, stopAll]);

  const start = useCallback(async () => {
    stopAll();
    setPermissionDenied(false);
    setStatus('idle');
    setActiveStep(0);
    setStepProgress(0);
    runningRef.current = true;

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
      console.error('[WebcamCheck] Failed to load model weights.', e);
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

    // 25-second hard timeout for the whole liveness check
    timeoutRef.current = setTimeout(() => {
      if (!runningRef.current) return;
      cancelAnimationFrame(rafRef.current);
      setStatus('timeout');
    }, 25_000);

    let currentStepIdx = 0;
    let currentProgress = 0;
    let lastTime = Date.now();

    const detect = async () => {
      if (!runningRef.current || !video || video.paused || video.ended) return;

      const detection = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }),
      );

      if (!runningRef.current) return;

      if (detection) {
        const { box } = detection;
        // Normalize coordinates (mirrored for video transform)
        // Face position relative to video frame (mirrored)
        const fx = 100 - ((box.x + box.width / 2) / video.videoWidth) * 100;
        const fy = ((box.y + box.height / 2) / video.videoHeight) * 100;

        setFacePosition({ x: fx, y: fy });

        if (status === 'scanning') {
          // Locked face, start tracking
          setStatus('tracking');
          setDotPos(TARGET_STEPS[0]);
        }

        if (status === 'tracking') {
          const target = TARGET_STEPS[currentStepIdx];
          const dist = Math.sqrt(Math.pow(fx - target.x, 2) + Math.pow(fy - target.y, 2));

          const now = Date.now();
          const dt = now - lastTime;
          lastTime = now;

          // If face is close to dot, increase progress
          if (dist < 15) {
            currentProgress += dt / 15; // Takes ~1.5s to fill
          } else {
            currentProgress = Math.max(0, currentProgress - dt / 30); // Slowly drain if away
          }

          setStepProgress(Math.min(100, currentProgress));

          if (currentProgress >= 100) {
             currentStepIdx++;
             if (currentStepIdx < TARGET_STEPS.length) {
               setActiveStep(currentStepIdx);
               setDotPos(TARGET_STEPS[currentStepIdx]);
               currentProgress = 0;
             } else {
               // SUCCESS — All steps done
               cancelAnimationFrame(rafRef.current);
               clearTimeout(timeoutRef.current!);
               
               // Capture image
               const canvas = document.createElement('canvas');
               canvas.width = video.videoWidth;
               canvas.height = video.videoHeight;
               canvas.getContext('2d')?.drawImage(video, 0, 0);
               const imageUrl = canvas.toDataURL('image/jpeg', 0.85);
               const score = 85 + Math.floor(Math.random() * 15); // Higher score for passing liveness
               
               finalize(score, imageUrl);
               return;
             }
          }
        }
      } else {
        setFacePosition(null);
        currentProgress = Math.max(0, currentProgress - 5); // Faster drain if face lost
        setStepProgress(currentProgress);
      }

      rafRef.current = requestAnimationFrame(() => void detect());
    };

    rafRef.current = requestAnimationFrame(() => void detect());
  }, [onComplete, stopAll, finalize, status]);

  useEffect(() => {
    start();
    return stopAll;
  }, [start, stopAll]);

  const isTimedOut = status === 'timeout';

  return (
    <div className="font-mono select-none">
      <div className="border border-ink/10 p-1 max-w-[420px] bg-slate-50/50 backdrop-blur-xl rounded-lg shadow-2xl">
        <div className="border border-ink/5 bg-white rounded-md p-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === 'tracking' ? 'bg-amber-500 animate-pulse' : status === 'complete' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-ink/40">
                Liveness Verification
              </p>
            </div>
            {status === 'tracking' && (
              <div className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                MOVE NOSE TO TARGET
              </div>
            )}
          </div>

          {/* Camera viewport */}
          <div className="relative bg-[#0a0a0a] aspect-[4/3] overflow-hidden rounded-sm border border-slate-900 shadow-inner">
            {/* Loading placeholder */}
            {(status === 'idle' || status === 'loading') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-slate-950">
                 <div className="w-12 h-12 border-2 border-slate-800 border-t-slate-400 rounded-full animate-spin" />
                 <p className="text-[9px] tracking-widest text-slate-500 uppercase">HCA Biometric Boot</p>
              </div>
            )}

            <video
              ref={videoRef}
              muted
              playsInline
              className={`w-full h-full object-cover block transition-opacity duration-1000 ${
                status === 'idle' || status === 'loading' ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Tracking UI Overlay */}
            {status === 'tracking' && (
              <div className="absolute inset-0 pointer-events-none">
                {/* The Dot */}
                <div 
                  className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
                  style={{ left: `${dotPos.x}%`, top: `${dotPos.y}%` }}
                >
                  <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-ping" />
                  <div className="absolute inset-1 border border-white/60 rounded-full" />
                  <div className="absolute inset-[30%] bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                  
                  {/* Progress Ring around dot */}
                  <svg className="absolute inset-0 -rotate-90">
                    <circle 
                      cx="16" cy="16" r="14" 
                      fill="none" stroke="white" strokeWidth="2" 
                      strokeDasharray={88}
                      strokeDashoffset={88 - (88 * stepProgress) / 100}
                      className="transition-all duration-100"
                    />
                  </svg>
                </div>

                {/* Face indicator (mirrored) */}
                {facePosition && (
                   <div 
                    className="absolute w-6 h-6 border-2 border-emerald-400/30 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${facePosition.x}%`, top: `${facePosition.y}%` }}
                   >
                     <div className="absolute inset-0 bg-emerald-400/10 rounded-full animate-pulse" />
                   </div>
                )}
              </div>
            )}

            {/* Scan Reticle while scanning */}
            {status === 'scanning' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border border-white/20 rounded-[40%] relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2">
                    <p className="text-[8px] text-white/40 tracking-[0.3em] uppercase">Align Face</p>
                  </div>
                  <div className="absolute inset-x-0 top-0 h-px bg-emerald-400/40 animate-scan" />
                </div>
              </div>
            )}

            {/* Success Overlay */}
            {status === 'complete' && (
               <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
                  <div className="bg-white p-4 rounded-full shadow-2xl">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
               </div>
            )}
          </div>

          {/* Status line */}
          <div className="mt-4 flex justify-between items-end">
            <div>
              <p className={`text-[11px] font-bold tracking-tight uppercase ${status === 'timeout' ? 'text-red-500' : 'text-ink'}`}>
                {STATUS_TEXT[status]}
              </p>
              {status === 'tracking' && (
                <p className="text-[9px] text-ink/40 mt-1 uppercase tracking-widest">
                  Checkpoint {activeStep + 1} of {TARGET_STEPS.length}
                </p>
              )}
            </div>
            
            {status === 'tracking' && (
               <div className="text-right">
                  <div className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 border border-slate-200">
                    {Math.round(stepProgress)}%
                  </div>
               </div>
            )}
          </div>

          {/* Timeout + retry */}
          {isTimedOut && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
              <p className="text-[10px] text-red-500/60 leading-relaxed italic mb-4">
                Institutional security protocol failed to verify biometric persistence. Please ensure you are in a well-lit environment.
              </p>
              <button
                onClick={start}
                className="w-full bg-ink text-white py-3 text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-slate-800 transition-colors shadow-lg"
              >
                Re-initialize Scan
              </button>
            </div>
          )}

          {/* Camera permission denied */}
          {permissionDenied && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded">
              <p className="text-[10px] text-red-700 font-bold uppercase tracking-tight">Camera Access Required</p>
              <p className="text-[10px] text-red-600/70 mt-1 italic leading-relaxed">
                Hardware biometric link cannot be established. Please enable camera permissions.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Meta */}
      <div className="mt-4 flex items-center justify-between px-2">
         <div className="flex gap-2">
            <span className="w-1 h-1 rounded-full bg-ink/20" />
            <span className="w-1 h-1 rounded-full bg-ink/20" />
            <span className="w-1 h-1 rounded-full bg-ink/20" />
         </div>
         <span className="font-mono text-[8px] text-ink/20 uppercase tracking-[0.2em]">HCA-BIO-V4.2</span>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
