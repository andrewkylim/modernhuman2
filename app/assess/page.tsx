"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Certificate, { AIReport } from "@/components/Certificate";
import HumanityQuestions, { FormattedAnswer } from "@/components/HumanityQuestions";

// Dynamically import camera/canvas components to avoid SSR issues
const WebcamCheck = dynamic(() => import("@/components/WebcamCheck"), { ssr: false });
const DrawingTest = dynamic(() => import("@/components/DrawingTest"), { ssr: false });

// ─── Step components ──────────────────────────────────────────────────────────

function NameEntry({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] tracking-widest uppercase text-[#1A1A1A]/40 mb-2">
          Step 1 of 5
        </div>
        <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Identity registration</h2>
        <p className="text-sm text-[#1A1A1A]/50 leading-relaxed max-w-sm">
          Provide your full legal name as it will appear on your certificate. Nicknames are
          accepted. Handles are not.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-widest uppercase text-[#1A1A1A]/60 mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Jane A. Mortal"
          className="w-full max-w-sm border border-[#1A1A1A]/20 bg-white px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#1B2E4B] transition-colors"
        />
        <p className="text-[10px] text-[#1A1A1A]/35 mt-2">
          This name will be printed on your official Human Certificate.
        </p>
      </div>
    </div>
  );
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: "name",      label: "Identity"   },
  { id: "questions", label: "Assessment" },
  { id: "webcam",    label: "Biometric"  },
  { id: "drawing",   label: "Drawing"    },
  { id: "results",   label: "Certificate"},
] as const;

type StepId = (typeof STEPS)[number]["id"];

// Steps that auto-advance — no Continue button shown
const AUTO_ADVANCE: StepId[] = ["webcam", "drawing", "questions"];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AssessPage() {
  const [currentStep, setCurrentStep] = useState<StepId>("name");
  const [name, setName] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState<FormattedAnswer[]>([]);
  const [webcamScore, setWebcamScore] = useState(0);
  const [drawingScore, setDrawingScore] = useState(0);
  const [drawingImageUrl, setDrawingImageUrl] = useState("");
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
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

  const showContinue = !isLast && !AUTO_ADVANCE.includes(currentStep) && currentStep !== "results";
  const canAdvance = currentStep !== "name" || name.trim().length > 0;

  // Trigger AI analysis when drawing step completes and we reach results
  useEffect(() => {
    if (currentStep !== "results" || aiReport || analyzing) return;

    setAnalyzing(true);
    setAnalyzeError(null);

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || "Anonymous Human",
        answers: questionAnswers,
        webcamScore,
        drawingScore,
      }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e.message || "Analysis failed"));
        return res.json();
      })
      .then((report: AIReport) => {
        setAiReport(report);
        setAnalyzing(false);
      })
      .catch((err) => {
        setAnalyzeError(typeof err === "string" ? err : "Analysis failed. Please try again.");
        setAnalyzing(false);
      });
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">
      {/* Security status bar */}
      <div className="bg-[#1B2E4B] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50">
              Secure assessment session
            </span>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-white/30 hidden sm:block">
            modernhuman.io / HCA Assessment Portal
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-[#1A1A1A]/10 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#1B2E4B] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-wider">HCA</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-[#1B2E4B]">
                modernhuman.io
              </div>
              <div className="text-[10px] text-[#1A1A1A]/40 tracking-widest uppercase">
                Human Certification Authority
              </div>
            </div>
          </Link>

          {/* Step progress — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {STEPS.map((step, i) => {
              const isDone = i < currentIndex;
              const isActive = step.id === currentStep;
              return (
                <div key={step.id} className="flex items-center gap-1">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest uppercase transition-colors ${
                      isActive
                        ? "bg-[#1B2E4B] text-white"
                        : isDone
                          ? "text-[#1B2E4B]/70"
                          : "text-[#1A1A1A]/30"
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isActive ? "bg-white" : isDone ? "bg-[#1B2E4B]" : "bg-[#1A1A1A]/20"
                      }`}
                    />
                    {step.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <span className="text-[#1A1A1A]/20 text-xs">&#x2192;</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile step indicator */}
      <div className="md:hidden border-b border-[#1A1A1A]/10">
        <div className="max-w-6xl mx-auto px-6 py-2">
          <div className="flex gap-1">
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                className={`h-0.5 flex-1 transition-colors ${
                  i <= currentIndex ? "bg-[#1B2E4B]" : "bg-[#1A1A1A]/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-lg">

          {/* Step 1: Name */}
          {currentStep === "name" && (
            <NameEntry value={name} onChange={setName} />
          )}

          {/* Step 2: Questions */}
          {currentStep === "questions" && (
            <div className="space-y-8">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-[#1A1A1A]/40 mb-2">
                  Step 2 of 5
                </div>
                <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Humanity assessment</h2>
                <p className="text-sm text-[#1A1A1A]/50 leading-relaxed max-w-sm">
                  Answer each question honestly. The system detects optimised responses.
                </p>
              </div>
              <HumanityQuestions
                onComplete={(score, answers) => {
                  setQuestionAnswers(answers);
                  goNext();
                }}
              />
            </div>
          )}

          {/* Step 3: Webcam */}
          {currentStep === "webcam" && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-[#1A1A1A]/40 mb-2">
                  Step 3 of 5
                </div>
                <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Biometric verification</h2>
                <p className="text-sm text-[#1A1A1A]/50 leading-relaxed max-w-sm">
                  A single webcam frame is analyzed for humanoid facial characteristics. Mild
                  asymmetry improves your score. Perfect symmetry triggers a review flag.
                </p>
              </div>
              <WebcamCheck
                onComplete={(score) => {
                  setWebcamScore(score);
                  goNext();
                }}
              />
              <p className="text-[10px] text-[#1A1A1A]/35 max-w-sm">
                No images are stored. Analysis occurs locally. We have no interest in your face
                beyond confirming it exists.
              </p>
            </div>
          )}

          {/* Step 4: Drawing */}
          {currentStep === "drawing" && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-[#1A1A1A]/40 mb-2">
                  Step 4 of 5
                </div>
                <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Humanity drawing sample</h2>
                <p className="text-sm text-[#1A1A1A]/50 leading-relaxed max-w-sm">
                  Draw a dog from memory. A perfect drawing indicates non-human origin. Your
                  imperfection is the data.
                </p>
              </div>
              <DrawingTest
                onComplete={(score, imageUrl) => {
                  setDrawingScore(score);
                  setDrawingImageUrl(imageUrl);
                  goNext();
                }}
              />
            </div>
          )}

          {/* Step 5: Results */}
          {currentStep === "results" && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-[#1A1A1A]/40 mb-2">
                  Step 5 of 5
                </div>
                <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Assessment complete</h2>
                <p className="text-sm text-[#1A1A1A]/50 leading-relaxed max-w-sm">
                  Your humanity has been evaluated against the Human Standard Rev. 14.2.
                </p>
              </div>

              {analyzing && (
                <div className="py-16 space-y-6">
                  {/* Animated scan graphic */}
                  <div className="flex justify-center">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border border-[#1B2E4B]/20 rounded-full animate-ping" />
                      <div className="absolute inset-2 border border-[#1B2E4B]/30 rounded-full animate-ping" style={{ animationDelay: "0.3s" }} />
                      <div className="absolute inset-4 border border-[#1B2E4B]/40 rounded-full animate-ping" style={{ animationDelay: "0.6s" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#1B2E4B] rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-mono text-xs tracking-[0.25em] uppercase text-[#1A1A1A]/60">
                      Calculating humanity index
                    </p>
                    <p className="font-mono text-[10px] tracking-widest text-[#1A1A1A]/30">
                      Cross-referencing against Human Standard Rev. 14.2
                    </p>
                  </div>
                  {/* Scrolling data lines */}
                  <div className="border border-[#1A1A1A]/8 bg-white p-4 font-mono text-[9px] text-[#1A1A1A]/30 space-y-1 max-w-sm mx-auto">
                    {["BODY............analyzing", "MIND............analyzing", "PURPOSE.........analyzing", "CONNECTION......analyzing", "GROWTH..........analyzing", "SECURITY........analyzing"].map((line) => (
                      <div key={line} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analyzeError && (
                <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 space-y-2">
                  <p className="font-mono text-xs tracking-widest uppercase">Analysis failed</p>
                  <p className="text-xs opacity-75">{analyzeError}</p>
                  <button
                    onClick={() => {
                      setAiReport(null);
                      setAnalyzing(false);
                      setAnalyzeError(null);
                      // Re-trigger by briefly toggling step
                      setCurrentStep("drawing");
                      setTimeout(() => setCurrentStep("results"), 50);
                    }}
                    className="text-xs underline hover:no-underline"
                  >
                    Retry analysis
                  </button>
                </div>
              )}

              {!analyzing && !analyzeError && aiReport && (
                <Certificate
                  name={name.trim() || "Anonymous Human"}
                  webcamScore={webcamScore}
                  drawingScore={drawingScore}
                  drawingImageUrl={drawingImageUrl}
                  issuedAt={new Date()}
                  aiReport={aiReport}
                />
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#1A1A1A]/10">
            <button
              onClick={goPrev}
              disabled={isFirst || (currentStep === "results" && analyzing)}
              className="text-sm text-[#1A1A1A]/50 tracking-wide hover:text-[#1A1A1A] transition-colors disabled:opacity-0 disabled:pointer-events-none flex items-center gap-2"
            >
              <span className="text-xs">&#x2190;</span>
              Back
            </button>

            {showContinue && (
              <button
                onClick={goNext}
                disabled={!canAdvance}
                className="bg-[#1B2E4B] text-white px-8 py-3 text-sm tracking-wide font-medium hover:bg-[#1B2E4B]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}

            {isLast && !analyzing && (
              <Link
                href="/"
                className="text-sm text-[#1A1A1A]/50 tracking-wide hover:text-[#1A1A1A] transition-colors"
              >
                Return to registry
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
