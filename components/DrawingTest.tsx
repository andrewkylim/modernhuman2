"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Stroke {
  points: Point[];
}

interface DrawingTestProps {
  onComplete: (score: number, imageDataUrl: string) => void;
}

function analyzeDrawing(strokes: Stroke[], startTime: number): number {
  if (strokes.length === 0) return 15;

  // 1. Stroke count (0–25 pts). Sweet spot ~10–15; diminishing returns after 20.
  const strokeCountScore = Math.min(25, Math.sqrt(strokes.length / 20) * 25);

  // 2. Stroke length variance (0–25 pts). High CV = irregular = human.
  const strokeLengths = strokes.map((s) => {
    let len = 0;
    for (let i = 1; i < s.points.length; i++) {
      const dx = s.points[i].x - s.points[i - 1].x;
      const dy = s.points[i].y - s.points[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  });
  const avgLen = strokeLengths.reduce((a, b) => a + b, 0) / strokeLengths.length;
  const variance =
    strokeLengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) /
    strokeLengths.length;
  const stdDev = Math.sqrt(variance);
  const cv = avgLen > 0 ? stdDev / avgLen : 0;
  const lengthVarianceScore = Math.min(25, cv * 40);

  // 3. Direction change frequency (0–25 pts). Humans second-guess; lines aren't straight.
  let directionChanges = 0;
  let segments = 0;
  for (const stroke of strokes) {
    for (let i = 2; i < stroke.points.length; i++) {
      const dx1 = stroke.points[i - 1].x - stroke.points[i - 2].x;
      const dy1 = stroke.points[i - 1].y - stroke.points[i - 2].y;
      const dx2 = stroke.points[i].x - stroke.points[i - 1].x;
      const dy2 = stroke.points[i].y - stroke.points[i - 1].y;
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (len1 > 0 && len2 > 0) {
        const dot = (dx1 * dx2 + dy1 * dy2) / (len1 * len2);
        const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
        if (angle > Math.PI / 8) directionChanges++; // threshold: 22.5°
        segments++;
      }
    }
  }
  const dirChangeRatio = segments > 0 ? directionChanges / segments : 0;
  const directionScore = Math.min(25, dirChangeRatio * 50);

  // 4. Time-to-first-stroke / hesitation (0–25 pts). Instant = bot-like; 0.5–5s = human.
  const firstStrokeDelay = strokes[0].points[0].time - startTime;
  let hesitationScore: number;
  if (firstStrokeDelay < 300) {
    hesitationScore = 5;
  } else if (firstStrokeDelay < 5000) {
    hesitationScore = 15 + (firstStrokeDelay / 5000) * 10;
  } else if (firstStrokeDelay < 15000) {
    hesitationScore = 20;
  } else {
    hesitationScore = 15;
  }

  return Math.round(
    Math.min(100, strokeCountScore + lengthVarianceScore + directionScore + hesitationScore)
  );
}

export default function DrawingTest({ onComplete }: DrawingTestProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [strokeCount, setStrokeCount] = useState(0);
  const isDrawingRef = useRef(false);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalizedRef = useRef(false);

  const finalize = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageDataUrl = canvas.toDataURL("image/png");
    const score = analyzeDrawing(strokesRef.current, startTimeRef.current);
    onComplete(score, imageDataUrl);
  }, [onComplete]);

  // Start countdown on mount
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Finalize when timer hits zero
  useEffect(() => {
    if (timeLeft === 0) finalize();
  }, [timeLeft, finalize]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (finalizedRef.current) return;
    isDrawingRef.current = true;
    const pos = getPos(e);
    currentStrokeRef.current = [{ ...pos, time: Date.now() }];
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current || finalizedRef.current) return;
    const pos = getPos(e);
    currentStrokeRef.current.push({ ...pos, time: Date.now() });
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentStrokeRef.current.length > 1) {
      strokesRef.current.push({ points: [...currentStrokeRef.current] });
      setStrokeCount(strokesRef.current.length);
    }
    currentStrokeRef.current = [];
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-1">
          Biometric Assessment — Module 2 of 2
        </p>
        <h2 className="font-mono text-sm font-bold tracking-[0.2em] uppercase text-gray-900">
          HUMANITY DRAWING SAMPLE
        </h2>
        <div className="w-full h-px bg-gray-300 mt-2" />
      </div>

      {/* Instruction */}
      <p className="font-mono text-sm text-gray-700 text-center">
        Draw a dog from memory.
      </p>

      {/* Timer */}
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-widest uppercase text-gray-400 mb-0.5">
          Time Remaining
        </p>
        <p
          className={`font-mono text-4xl font-bold tabular-nums leading-none transition-colors ${
            timeLeft <= 10 ? "text-red-600" : "text-gray-900"
          }`}
        >
          {String(timeLeft).padStart(2, "0")}
        </p>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        className="w-full border border-gray-400 bg-white cursor-crosshair touch-none select-none"
        style={{ maxWidth: 480 }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      <button
        onClick={finalize}
        disabled={strokeCount === 0}
        className="bg-[#1B2E4B] text-white px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-[#1B2E4B]/90 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
      >
        Finalize Sketch
      </button>

      {/* Status line */}
      <p className="font-mono text-xs text-gray-400 self-start">
        {strokeCount === 0
          ? "[ awaiting input ]"
          : `[ ${strokeCount} stroke${strokeCount !== 1 ? "s" : ""} recorded ]`}
      </p>
    </div>
  );
}
