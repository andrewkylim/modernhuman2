"use client";

import { useRef, useEffect, useState } from "react";

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Stroke {
  points: Point[];
}

interface DrawingReplayProps {
  strokes: Stroke[];
  height?: number;
  width?: number;
}

export default function DrawingReplay({ strokes, height = 360, width = 480 }: DrawingReplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const animationRef = useRef<number>();

  const startReplay = () => {
    if (isReplaying || strokes.length === 0) return;
    setIsReplaying(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allPoints: { x: number; y: number; time: number; isStart: boolean }[] = [];
    strokes.forEach((stroke) => {
      stroke.points.forEach((point, idx) => {
        allPoints.push({ ...point, isStart: idx === 0 });
      });
    });

    if (allPoints.length === 0) return;

    const startTime = allPoints[0].time;
    let pointIndex = 0;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - replayStartTime) * 1.5; // 1.5x speed for better UX

      while (pointIndex < allPoints.length && (allPoints[pointIndex].time - startTime) <= elapsed) {
        const point = allPoints[pointIndex];
        
        ctx.strokeStyle = "#1B2E4B";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (point.isStart) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
        
        pointIndex++;
      }

      if (pointIndex < allPoints.length) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsReplaying(false);
      }
    };

    const replayStartTime = Date.now();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Initial draw of the final result
    const canvas = canvasRef.current;
    if (!canvas || isReplaying) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = "#1B2E4B";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    });
  }, [strokes, isReplaying]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative border border-[#1A1A1A]/10 bg-white">
        <canvas 
          ref={canvasRef} 
          width={width} 
          height={height} 
          className="max-w-full h-auto grayscale opacity-80"
        />
        {!isReplaying && (
          <button 
            onClick={startReplay}
            className="absolute inset-0 flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors group"
          >
            <div className="bg-white/90 px-4 py-2 border border-[#1B2E4B]/20 shadow-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-[#1B2E4B]">
                Play Hard Proof Replay
              </span>
            </div>
          </button>
        )}
      </div>
      <p className="font-mono text-[9px] text-[#1A1A1A]/30 uppercase tracking-widest">
        {isReplaying ? "[ Replaying Movement Diagnostic... ]" : "[ Replay movement data ]"}
      </p>
    </div>
  );
}
