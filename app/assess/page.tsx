"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AIReport } from "@/components/Certificate";
import HumanityQuestions, { FormattedAnswer } from "@/components/HumanityQuestions";
import { supabase } from "@/lib/supabase";

// Dynamically import camera/canvas components to avoid SSR issues
const WebcamCheck = dynamic(() => import("@/components/WebcamCheck"), { ssr: false });
const DrawingTest = dynamic(() => import("@/components/DrawingTest"), { ssr: false });

interface Point {
  x: number;
  y: number;
  time: number;
}

interface Stroke {
  points: Point[];
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: "name",         label: "Biometric Identity"   },
  { id: "webcam",       label: "Biometric Liveness"  },
  { id: "drawing",      label: "Motor Diagnostic"    },
  { id: "verification", label: "Verification Synthesis" },
  { id: "questions",    label: "Cognitive Profile" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// Steps that auto-advance
const AUTO_ADVANCE: StepId[] = ["webcam", "drawing", "verification"];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AssessPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepId>("name");
  const [name, setName] = useState("");
  const [webcamScore, setWebcamScore] = useState(0);
  const [webcamImageUrl, setWebcamImageUrl] = useState("");
  const [drawingScore, setDrawingScore] = useState(0);
  const [drawingImageUrl, setDrawingImageUrl] = useState("");
  const [drawingStrokes, setDrawingStrokes] = useState<Stroke[]>([]); 
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEPS.length - 1;

  function goNext() {
    if (!isLast) setCurrentStep(STEPS[currentIndex + 1].id);
  }

  function goPrev() {
    if (!isFirst) setCurrentStep(STEPS[currentIndex - 1].id);
  }

  const showContinue = !isLast && !AUTO_ADVANCE.includes(currentStep) && currentStep !== "questions";
  const canAdvance = currentStep !== "name" || name.trim().length > 0;

  async function analyzeAssessment(answers: FormattedAnswer[], ws: number, ds: number) {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || "Anonymous Human",
        answers,
        webcamScore: ws,
        drawingScore: ds,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Analysis failed");
    }
    return res.json() as Promise<AIReport>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] flex flex-col">
      {/* Network Status Header */}
      <div className="bg-[#1B2E4B] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50">
              Registry Node 001 / SECURE SESSION
            </span>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-white/30 hidden sm:block">
            HCA-PROTOCOL-V1.4
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-[#1A1A1A]/10 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" >
            <div className="w-8 h-8 bg-[#1B2E4B] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-wider">HCA</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-[#1B2E4B] uppercase tracking-widest">
                modernhuman.io
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/registry" className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#1B2E4B]/40 hover:text-[#1B2E4B] transition-colors mr-6">
              [ Public Registry ]
            </Link>
            {STEPS.map((step, i) => {
              const isDone = i < currentIndex;
              const isActive = step.id === currentStep;
              return (
                <div key={step.id} className="flex items-center gap-1">
                  <div className={`px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase transition-colors flex items-center gap-2 ${
                    isActive ? "bg-[#1B2E4B] text-white" : isDone ? "text-[#1B2E4B]/60" : "text-[#1A1A1A]/20"
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${isActive ? "bg-white" : isDone ? "bg-[#1B2E4B]" : "bg-[#1A1A1A]/20"}`} />
                    {step.label}
                  </div>
                  {i < STEPS.length - 1 && <span className="text-[#1A1A1A]/10 text-[10px]">/</span>}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Progress Bar */}
      <div className="md:hidden h-1 bg-[#1A1A1A]/5">
        <div 
          className="h-full bg-[#1B2E4B] transition-all duration-500" 
          style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }} 
        />
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          {currentStep === "name" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#1A1A1A]/30 mb-2">Protocol Initialization</p>
                <h2 className="text-3xl font-bold text-[#1B2E4B] mb-4">Subject Identity declaration</h2>
                <p className="text-sm text-[#1A1A1A]/50 leading-relaxed font-serif italic max-w-md mx-auto">
                  Provide the designation that will be cryptographically bound to your biometrical status and movement diagnostic.
                </p>
              </div>
              <div className="max-w-md mx-auto space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="SUBJECT NAME"
                  className="w-full bg-white border-2 border-[#1B2E4B] px-6 py-4 text-center text-lg font-mono text-[#1B2E4B] placeholder:opacity-20 focus:outline-none transition-all rounded-none"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) goNext(); }}
                />
                <button 
                  onClick={goNext}
                  disabled={!name.trim()}
                  className="w-full bg-[#1B2E4B] text-white py-4 font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-[#1B2E4B]/90 transition-colors disabled:opacity-20 shadow-xl"
                >
                  Confirm Identity & Start Protocol
                </button>
              </div>
            </div>
          )}

          {currentStep === "webcam" && (
            <div className="animate-in fade-in duration-700">
               <WebcamCheck
                onComplete={(score, imageUrl) => {
                  setWebcamScore(score);
                  setWebcamImageUrl(imageUrl);
                  goNext();
                }}
              />
            </div>
          )}

          {currentStep === "drawing" && (
            <div className="animate-in fade-in duration-700 flex flex-col items-center">
              <DrawingTest
                onComplete={(score, url, strokes) => {
                  setDrawingScore(score);
                  setDrawingImageUrl(url);
                  setDrawingStrokes(strokes);
                  goNext();
                }}
              />
            </div>
          )}

          {currentStep === "verification" && (
            <div className="py-12 animate-in fade-in duration-1000 text-center">
              <div className="relative w-32 h-32 mx-auto mb-12">
                <div className="absolute inset-0 border-2 border-[#1B2E4B]/5 rounded-full" />
                <div className="absolute inset-0 border-t-2 border-[#1B2E4B] rounded-full animate-spin" />
                <div className="absolute inset-4 border border-[#1B2E4B]/10 rounded-full animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[10px] font-bold text-[#1B2E4B] animate-pulse">SYNTHESIZING</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#1B2E4B] mb-2 uppercase tracking-tight">Biometric Hash Generation</h3>
              <p className="text-[10px] text-[#1A1A1A]/40 mb-12 font-mono tracking-[0.25em] uppercase">[ Cross-referencing Hard Proof streams ]</p>
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="p-5 bg-white border border-[#1B2E4B]/10 text-left relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#1B2E4B] font-bold">Spatial Navigation Verified</span>
                    </div>
                    <span className="font-mono text-[8px] text-emerald-600 font-bold">100%</span>
                  </div>
                  <p className="text-[11px] text-[#1A1A1A]/50 leading-relaxed italic font-serif">
                    Nose-to-target coordinates confirmed. Spatial awareness confirms biological presence.
                  </p>
                </div>

                <div className="p-5 bg-white border border-[#1B2E4B]/10 text-left relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#1B2E4B] font-bold">Organic Jitter Analyzed</span>
                    </div>
                    <span className="font-mono text-[8px] text-emerald-600 font-bold">HASHED</span>
                  </div>
                  <p className="text-[11px] text-[#1A1A1A]/50 leading-relaxed italic font-serif">
                    Motor diagnostic data successfully converted to a unique biological signature.
                  </p>
                </div>
                
                <button 
                  onClick={goNext}
                  className="w-full bg-[#1B2E4B] text-white py-5 font-bold tracking-[0.4em] uppercase text-[11px] shadow-2xl hover:bg-[#1B2E4B]/90 transition-all mt-8 group"
                >
                  Proceed to Cognitive Profile
                  <span className="ml-4 opacity-30 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              </div>
            </div>
          )}

          {currentStep === "questions" && (
            <div className="animate-in fade-in duration-700">
               <HumanityQuestions
                onComplete={async (score, answers) => {
                  setAnalyzing(true);
                  try {
                    const result = await analyzeAssessment(answers, webcamScore, drawingScore);
                    const { data, error } = await supabase
                      .from("assessments")
                      .insert({
                        name: name.trim() || "Anonymous Human",
                        modern_human_score: result.modernHumanScore,
                        certification_tier: result.certificationTier,
                        ai_report: result,
                        webcam_url: webcamImageUrl,
                        drawing_url: drawingImageUrl,
                        drawing_path: drawingStrokes,
                      })
                      .select("id")
                      .single();
                    
                    if (error) throw error;
                    if (data) {
                      router.replace(`/verify/${data.id}`);
                    }
                  } catch (err: unknown) {
                    setAnalyzeError(err instanceof Error ? err.message : "Registry process failure.");
                  } finally {
                    setAnalyzing(false);
                  }
                }}
              />
            </div>
          )}

          {/* Analysis Overlay */}
          {analyzing && (
            <div className="fixed inset-0 bg-[#FAFAF8]/95 z-[100] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
               <div className="relative w-24 h-24 mb-12">
                  <div className="absolute inset-0 border-4 border-[#1B2E4B] border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[10px] font-bold text-[#1B2E4B] animate-pulse uppercase tracking-tighter">HCA</span>
                  </div>
               </div>
               <h3 className="text-2xl font-bold text-[#1B2E4B] mb-4 uppercase tracking-[0.2em]">Processing Record</h3>
               <p className="text-sm text-[#1A1A1A]/50 font-serif italic mb-12 max-w-sm">
                Synthesizing biometric data points and cognitive response vectors into a unified humanity index...
               </p>
               <div className="space-y-2">
                 {["DATA-POINT: ORGANIC JITTER HASHED", "DATA-POINT: COGNITIVE FRICTION ANALYZED", "DATA-POINT: BIOMETRIC LIVENESS CONFIRMED"].map((l, i) => (
                   <div key={l} className="font-mono text-[8px] tracking-[0.3em] text-[#1B2E4B]/20 animate-pulse" style={{ animationDelay: `${i*400}ms` }}>
                    {l}
                   </div>
                 ))}
               </div>
            </div>
          )}

          {analyzeError && (
             <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6">
                <div className="max-w-md text-center">
                  <div className="text-red-500 font-mono text-[10px] tracking-widest uppercase font-bold mb-4">Registry node error</div>
                  <h3 className="text-2xl font-bold text-[#1B2E4B] mb-4">Verification Interrupted</h3>
                  <p className="text-sm text-[#1A1A1A]/50 mb-8 leading-relaxed italic">{analyzeError}</p>
                  <button 
                    onClick={() => { setAnalyzeError(null); setCurrentStep("questions"); }}
                    className="bg-[#1B2E4B] text-white px-10 py-4 font-bold tracking-widest uppercase text-[10px]"
                  >
                    Retry Protocol
                  </button>
                </div>
             </div>
          )}

          {/* Bottom Nav */}
          {!analyzing && (
            <div className="mt-16 pt-8 border-t border-[#1A1A1A]/10 flex justify-between items-center">
              <button 
                onClick={goPrev}
                disabled={isFirst || currentStep === "verification"}
                className="text-[10px] font-mono uppercase tracking-widest text-[#1A1A1A]/30 hover:text-[#1B2E4B] transition-colors disabled:opacity-0"
              >
                [ Go Back ]
              </button>
              {showContinue && (
                <button 
                  onClick={goNext}
                  disabled={!canAdvance}
                  className="bg-[#1B2E4B] text-white px-8 py-4 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-[#1B2E4B] transition-all disabled:opacity-10 shadow-xl"
                >
                  Confirm & Proceed
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-[#1A1A1A]/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono text-[#1A1A1A]/30 uppercase tracking-widest">
           <div className="flex items-center gap-4">
              <span>HCA Registry Portal</span>
              <span>ISO-9001-26</span>
           </div>
           <div>© 2026 Human Certification Authority</div>
        </div>
      </footer>
    </div>
  );
}
