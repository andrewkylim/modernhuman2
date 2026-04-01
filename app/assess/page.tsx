"use client";

import { useState } from "react";
import Link from "next/link";

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
          Step 1 of 4
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

function WebcamCheck() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] tracking-widest uppercase text-[#1A1A1A]/40 mb-2">
          Step 2 of 4
        </div>
        <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Biometric verification</h2>
        <p className="text-sm text-[#1A1A1A]/50 leading-relaxed max-w-sm">
          A single webcam frame is analyzed for humanoid facial characteristics. Mild asymmetry
          improves your score. Perfect symmetry triggers a review flag.
        </p>
      </div>

      {/* Placeholder webcam area */}
      <div className="w-full max-w-sm aspect-video bg-[#1A1A1A]/5 border border-[#1A1A1A]/15 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-[#1A1A1A]/20 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-[#1A1A1A]/15 rounded-full" />
        </div>
        <span className="text-xs text-[#1A1A1A]/35 tracking-wide">Camera feed — coming soon</span>
      </div>

      <p className="text-[10px] text-[#1A1A1A]/35 max-w-sm">
        No images are stored. Analysis occurs locally. We have no interest in your face beyond
        confirming it exists.
      </p>
    </div>
  );
}

function DrawingTest() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] tracking-widest uppercase text-[#1A1A1A]/40 mb-2">
          Step 3 of 4
        </div>
        <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Humanity drawing sample</h2>
        <p className="text-sm text-[#1A1A1A]/50 leading-relaxed max-w-sm">
          Draw a circle in the canvas below. A perfect circle indicates non-human origin. Your
          imperfection is the data.
        </p>
      </div>

      {/* Placeholder canvas area */}
      <div className="w-full max-w-sm aspect-square bg-white border border-[#1A1A1A]/15 flex flex-col items-center justify-center gap-3 cursor-crosshair">
        <span className="text-xs text-[#1A1A1A]/30 tracking-wide select-none">
          Drawing canvas — coming soon
        </span>
      </div>

      <p className="text-[10px] text-[#1A1A1A]/35 max-w-sm">
        Deviation from a perfect circle is scored on a scale of 0 (robot) to 100 (gloriously
        human). Most humans score between 62 and 89.
      </p>
    </div>
  );
}

function Results({ name }: { name: string }) {
  const displayName = name.trim() || "Anonymous Human";

  // Deterministic tier based on name length for the shell
  const tierIndex = displayName.length % 5;
  const tiers = [
    { name: "Bronze", descriptor: "Occasionally Irrational" },
    { name: "Silver", descriptor: "Reliably Inconsistent" },
    { name: "Gold", descriptor: "Certified Mortal" },
    { name: "Platinum", descriptor: "Documented Failure History" },
    { name: "Diamond", descriptor: "Essentially Chaos" },
  ];
  const tier = tiers[tierIndex];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] tracking-widest uppercase text-[#1A1A1A]/40 mb-2">
          Step 4 of 4
        </div>
        <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Assessment complete</h2>
        <p className="text-sm text-[#1A1A1A]/50 leading-relaxed max-w-sm">
          Your humanity has been evaluated against the Human Standard Rev. 14.2. Results are
          below.
        </p>
      </div>

      {/* Certificate preview */}
      <div className="w-full max-w-sm border-2 border-[#1B2E4B] p-6 bg-white">
        <div className="text-center border-b border-[#1B2E4B]/20 pb-4 mb-4">
          <div className="text-[9px] tracking-widest uppercase text-[#1B2E4B]/60 mb-1">
            Human Certification Authority
          </div>
          <div className="text-xs text-[#1A1A1A]/40">Certificate of Humanity</div>
        </div>

        <div className="text-center mb-4">
          <div className="text-[10px] text-[#1A1A1A]/40 tracking-widest uppercase mb-1">
            This certifies that
          </div>
          <div className="text-lg font-semibold text-[#1A1A1A]">{displayName}</div>
          <div className="text-[10px] text-[#1A1A1A]/40 tracking-widest uppercase mt-3 mb-1">
            has achieved
          </div>
          <div className="text-base font-semibold text-[#1B2E4B]">{tier.name} Certification</div>
          <div className="text-xs text-[#1A1A1A]/55 italic mt-1">{tier.descriptor}</div>
        </div>

        <div className="border-t border-[#1B2E4B]/20 pt-4 flex justify-between items-end">
          <div>
            <div className="text-[9px] text-[#1A1A1A]/35 tracking-widest uppercase">
              Issued
            </div>
            <div className="text-[10px] text-[#1A1A1A]/55">1 April 2026</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-[#1A1A1A]/35 tracking-widest uppercase">
              Certificate No.
            </div>
            <div className="text-[10px] text-[#1A1A1A]/55 font-mono">
              HCA-{Math.abs(displayName.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 90000 + 10000}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-[#1A1A1A]/35 max-w-sm">
        Certificate download and verification link coming soon. Valid for 12 months from issue
        date.
      </p>
    </div>
  );
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: "name", label: "Identity" },
  { id: "webcam", label: "Biometric" },
  { id: "drawing", label: "Drawing" },
  { id: "results", label: "Certificate" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AssessPage() {
  const [currentStep, setCurrentStep] = useState<StepId>("name");
  const [name, setName] = useState("");

  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEPS.length - 1;

  function goNext() {
    if (!isLast) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  }

  function goPrev() {
    if (!isFirst) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  }

  const canAdvance = currentStep !== "name" || name.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">
      {/* Header */}
      <header className="border-b border-[#1A1A1A]/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#1B2E4B] flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-wider">HCA</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-[#1B2E4B]">
                Human Certification Authority
              </div>
              <div className="text-[10px] text-[#1A1A1A]/50 tracking-widest uppercase">
                Assessment Portal
              </div>
            </div>
          </Link>

          {/* Step progress */}
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
                      className={`w-1 h-1 rounded-full ${isActive ? "bg-white" : isDone ? "bg-[#1B2E4B]" : "bg-[#1A1A1A]/20"}`}
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
          {currentStep === "name" && <NameEntry value={name} onChange={setName} />}
          {currentStep === "webcam" && <WebcamCheck />}
          {currentStep === "drawing" && <DrawingTest />}
          {currentStep === "results" && <Results name={name} />}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#1A1A1A]/10">
            <button
              onClick={goPrev}
              disabled={isFirst}
              className="text-sm text-[#1A1A1A]/50 tracking-wide hover:text-[#1A1A1A] transition-colors disabled:opacity-0 disabled:pointer-events-none flex items-center gap-2"
            >
              <span className="text-xs">&#x2190;</span>
              Back
            </button>

            {!isLast ? (
              <button
                onClick={goNext}
                disabled={!canAdvance}
                className="bg-[#1B2E4B] text-white px-8 py-3 text-sm tracking-wide font-medium hover:bg-[#1B2E4B]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
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
