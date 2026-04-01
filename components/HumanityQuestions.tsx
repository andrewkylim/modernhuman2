"use client";

import { useState, useEffect } from "react";

export interface FormattedAnswer {
  domain: string;
  question: string;
  answer: string;
}

interface Option {
  label: string;
  score: number;
}

interface Question {
  id: string;
  domain: "bio-sensory" | "cognitive-friction" | "temporal-value" | "irrational-link";
  domainLabel: string;
  text: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: "sensory-memory",
    domain: "bio-sensory",
    domainLabel: "Bio-Sensory Analysis",
    text: "Select the sensory stimulus that most recently triggered a non-linear, vivid emotional memory independent of your current environment.",
    options: [
      { label: "A specific olfactory profile (scent).", score: 25 },
      { label: "A particular tactile texture or temperature.", score: 20 },
      { label: "A momentary acoustic frequency (sound).", score: 18 },
      { label: "No recent non-linear memory events.", score: 5 },
    ],
  },
  {
    id: "legacy-vs-survival",
    domain: "temporal-value",
    domainLabel: "Temporal Value Prioritization",
    text: "If presented with a choice between a 100% guaranteed biological survival for 10 years, or a 5% chance of achieving a 'Legacy Event' that persists after your frame's expiration, which is your instinctual priority?",
    options: [
      { label: "Stability: Guaranteed survival is the logical baseline.", score: 6 },
      { label: "Equilibrium: I would calculate the legacy value first.", score: 14 },
      { label: "Legacy: The persistence of meaning overrides survival.", score: 25 },
    ],
  },
  {
    id: "gut-feeling",
    domain: "irrational-link",
    domainLabel: "Irrational Link Detection",
    text: "Have you ever experienced a localized physical sensation (e.g., a 'gut feeling' or chest tightness) that correctly predicted an outcome despite overwhelming logical data to the contrary?",
    options: [
      { label: "Frequently. My biological intuition is a primary sensor.", score: 25 },
      { label: "Occasionally, though I often attempt to rationalize it.", score: 18 },
      { label: "Rarely. I prioritize explicitly calculated data.", score: 8 },
      { label: "Never. Sensations are internal noise, not data.", score: 4 },
    ],
  },
  {
    id: "physical-tremor",
    domain: "bio-sensory",
    domainLabel: "Bio-Sensory Analysis",
    text: "How often do you experience a brief, unprompted physical tremor or 'shiver' (the so-called 'rabbit over a grave' effect) with no environmental trigger?",
    options: [
      { label: "Regularly. It is an established feature of my system.", score: 25 },
      { label: "Periodically, usually during high-stakes thought cycles.", score: 18 },
      { label: "Rarely or not at all.", score: 8 },
    ],
  },
  {
    id: "art-vs-animal",
    domain: "irrational-link",
    domainLabel: "Irrational Link Detection",
    text: "You are in a burning facility. You can save either a priceless, original work of art (cultural legacy) or a stray animal with no social value. You have time for only one. Which do you retrieve?",
    options: [
      { label: "The Art: Cultural continuity is objectively higher value.", score: 4 },
      { label: "The Animal: I feel a biological resonance with the living entity.", score: 25 },
      { label: "Indecision: The conflict causes a temporary system stall.", score: 20 },
    ],
  },
  {
    id: "cognitive-drift",
    domain: "cognitive-friction",
    domainLabel: "Cognitive Friction Test",
    text: "When entering a new environment, how often do you experience a brief lapse in purposeful continuity (forgetting why you entered the room)?",
    options: [
      { label: "It is a standard occurrence. My intent is often fluid.", score: 25 },
      { label: "Occasionally, usually during high cognitive load.", score: 16 },
      { label: "Never. My objectives remain constantly cached.", score: 4 },
    ],
  },
];

const MAX_SCORE = QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.score)),
  0
);

interface Props {
  onComplete: (score: number, answers: FormattedAnswer[]) => void;
}

export default function HumanityQuestions({ onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [advancing, setAdvancing] = useState(false);

  const current = QUESTIONS[currentIdx];
  const isLast = currentIdx === QUESTIONS.length - 1;
  const progress = (currentIdx / QUESTIONS.length) * 100;

  if (!current) return null;

  function selectOption(optionIdx: number) {
    if (advancing) return;
    setAdvancing(true);

    const updated = { ...answers, [current.id]: optionIdx };
    setAnswers(updated);

    setTimeout(() => {
      if (!isLast) {
        setCurrentIdx((i) => i + 1);
        setAdvancing(false);
      } else {
        submit(updated);
      }
    }, 400); 
  }

  function submit(finalAnswers: Record<string, number>) {
    const total = QUESTIONS.reduce((sum, q) => {
      const idx = finalAnswers[q.id];
      return sum + (idx !== undefined ? q.options[idx].score : 0);
    }, 0);
    const score = Math.round((total / MAX_SCORE) * 100);

    const formatted: FormattedAnswer[] = QUESTIONS.map((q) => ({
      domain: q.domain,
      question: q.text,
      answer:
        finalAnswers[q.id] !== undefined
          ? q.options[finalAnswers[q.id]].label
          : "Declined",
    }));

    onComplete(score, formatted);
  }

  const domainColors: Record<string, string> = {
    "bio-sensory":       "#34d399", 
    "cognitive-friction": "#6366f1", 
    "temporal-value":    "#f59e0b", 
    "irrational-link":   "#ec4899", 
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Protocol Header */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#1B2E4B]/5 border border-[#1B2E4B]/10 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1B2E4B] animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#1B2E4B] font-bold">Cognitive Stress Test</span>
        </div>
        <h2 className="text-2xl font-bold text-[#1B2E4B] tracking-tight mb-2">Subject Response Required</h2>
        <p className="text-xs text-[#1A1A1A]/40 font-mono tracking-widest uppercase">Protocol HCA-Q-901</p>
      </div>

      <div className="bg-white border border-[#1B2E4B]/10 p-8 shadow-2xl relative overflow-hidden group">
         {/* Subtle corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-5">
           <svg viewBox="0 0 100 100" className="w-full h-full fill-[#1B2E4B]">
             <path d="M100 0 L100 100 L0 100 Z" />
           </svg>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: domainColors[current.domain] }}
              />
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#1B2E4B] font-bold">
                {current.domainLabel}
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#1B2E4B]/30">
              STRESSOR {currentIdx + 1} // {QUESTIONS.length}
            </span>
          </div>
          <div className="h-1 bg-slate-50 flex overflow-hidden rounded-full">
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: domainColors[current.domain],
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-10 min-h-[80px]">
          <p className="text-lg text-[#1B2E4B] leading-relaxed font-medium">
            {current.text}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {current.options.map((opt, idx) => {
            const selected = answers[current.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => selectOption(idx)}
                disabled={advancing && !selected}
                className={`w-full text-left text-sm px-6 py-4 border-2 transition-all duration-200 flex items-center justify-between group/opt ${
                  selected
                    ? "border-[#1B2E4B] bg-[#1B2E4B] text-white"
                    : "border-slate-100 text-[#1B2E4B]/60 hover:border-[#1B2E4B]/20 hover:bg-slate-50 hover:text-[#1B2E4B] bg-white"
                }`}
              >
                <span className="flex-1 font-medium">{opt.label}</span>
                <span className={`font-mono text-[10px] opacity-0 group-hover/opt:opacity-40 transition-opacity ${selected ? "opacity-40" : ""}`}>
                  [ SELECT ]
                </span>
              </button>
            );
          })}
        </div>

        {/* Technical Footer */}
        <div className="mt-12 pt-6 border-t border-slate-50 flex justify-between items-center">
           <div className="flex gap-4">
              {currentIdx > 0 && (
                <button
                  onClick={() => setCurrentIdx((i) => i - 1)}
                  className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#1B2E4B]/20 hover:text-[#1B2E4B]/50 transition-colors"
                >
                  [ VOLATILE_BACK ]
                </button>
              )}
           </div>
           <div className="font-mono text-[8px] text-slate-300 uppercase tracking-[0.3em]">
             BIOMETRIC_DATA_LINK_ENCRYPTED
           </div>
        </div>
      </div>
      
      {/* Subject Instructions */}
      <div className="mt-8 text-center px-12">
        <p className="text-[10px] text-[#1A1A1A]/30 italic font-serif leading-relaxed">
          Subject is advised to respond based on immediate biological impulse. 
          Logical pre-processing of answers is characterized as synthetic intent.
        </p>
      </div>
    </div>
  );
}
