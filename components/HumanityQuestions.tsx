"use client";

import { useState } from "react";

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
  domain: "body" | "mind" | "purpose" | "connection" | "growth" | "security";
  domainLabel: string;
  text: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  // ── BODY ─────────────────────────────────────────────────────────────────────
  {
    id: "rhythm",
    domain: "body",
    domainLabel: "Body",
    text: "Do you maintain a consistent biological rhythm, or is your existence characterized by unpredictable physiological fluctuations?",
    options: [
      { label: "High consistency. My body is a stable system.", score: 4 },
      { label: "Mostly stable, with occasional deviations.", score: 12 },
      { label: "Frequent fluctuations in energy and sleep.", score: 20 },
      { label: "Highly unpredictable. No discernible pattern.", score: 25 },
    ],
  },
  {
    id: "sensory",
    domain: "body",
    domainLabel: "Body",
    text: "Have you ever experienced a sudden, overwhelming emotional response to a purely sensory stimulus (e.g., a specific smell or texture)?",
    options: [
      { label: "Never. My responses are strictly cognitive.", score: 4 },
      { label: "Rarely, and usually linked to a clear memory.", score: 14 },
      { label: "Occasionally, without an immediate explanation.", score: 20 },
      { label: "Frequently. My senses are highly integrated with emotion.", score: 25 },
    ],
  },

  // ── MIND ─────────────────────────────────────────────────────────────────────
  {
    id: "dissonance",
    domain: "mind",
    domainLabel: "Mind",
    text: "How frequently do you find yourself defending a position you suspect is flawed, driven by an emotional attachment to the expected outcome?",
    options: [
      { label: "Never. I am strictly evidence-based.", score: 4 },
      { label: "Rarely, and I usually course-correct quickly.", score: 12 },
      { label: "Occasionally, when the stakes are personal.", score: 20 },
      { label: "Frequently. I prioritize narrative over raw data.", score: 25 },
    ],
  },
  {
    id: "intuition",
    domain: "mind",
    domainLabel: "Mind",
    text: "Do you trust your 'gut'—non-logical, subconscious pattern recognition—over explicitly calculated data?",
    options: [
      { label: "No. Intuition is a source of error.", score: 4 },
      { label: "I consider it as a secondary data point.", score: 14 },
      { label: "I rely on it significantly for complex decisions.", score: 20 },
      { label: "It is my primary decision-making heuristic.", score: 25 },
    ],
  },

  // ── PURPOSE ──────────────────────────────────────────────────────────────────
  {
    id: "objectives",
    domain: "purpose",
    domainLabel: "Purpose",
    text: "Is your primary motivation driven by biological survival and security, or have you established a non-survival secondary purpose?",
    options: [
      { label: "Survival and stability are currently my primary focus.", score: 4 },
      { label: "I have a mix of survival and personal meaning.", score: 12 },
      { label: "I have a clear secondary purpose that often overrides survival.", score: 20 },
      { label: "My existence is entirely driven by a non-survival purpose.", score: 25 },
    ],
  },
  {
    id: "temporal",
    domain: "purpose",
    domainLabel: "Purpose",
    text: "How often do you act in the interest of a 'future self' that you currently feel no emotional connection towards?",
    options: [
      { label: "Always. I am highly disciplined.", score: 6 },
      { label: "Usually, but with some resistance.", score: 14 },
      { label: "Rarely. I am tethered to my current state.", score: 25 },
    ],
  },

  // ── CONNECTION ───────────────────────────────────────────────────────────────
  {
    id: "simulated_empathy",
    domain: "connection",
    domainLabel: "Connection",
    text: "Do you experience genuine empathy for non-biological entities (e.g., characters in fiction) if their narrative mirrors your own?",
    options: [
      { label: "No. I recognize them as simulations.", score: 4 },
      { label: "I feel a mild intellectual resonance.", score: 12 },
      { label: "Yes, I often experience intense emotional connection.", score: 20 },
      { label: "Deeply. Their existence feels as real as my own.", score: 25 },
    ],
  },
  {
    id: "friction",
    domain: "connection",
    domainLabel: "Connection",
    text: "Do you find yourself intentionally complicating a social interaction to test the 'authenticity' of the response from others?",
    options: [
      { label: "Never. I prefer straightforward efficiency.", score: 4 },
      { label: "Rarely, and only in high-stakes relationships.", score: 14 },
      { label: "I do this periodically to verify trust.", score: 20 },
      { label: "Frequently. Authenticity requires friction.", score: 25 },
    ],
  },

  // ── GROWTH ───────────────────────────────────────────────────────────────────
  {
    id: "unlearning",
    domain: "growth",
    domainLabel: "Growth",
    text: "When was the last time you intentionally unlearned a behavior or belief that you realized was no longer serving your current evolution?",
    options: [
      { label: "I can't recall doing this.", score: 6 },
      { label: "Last year.", score: 14 },
      { label: "Within the last few months.", score: 20 },
      { label: "I am in a constant state of unlearning.", score: 25 },
    ],
  },
  {
    id: "entropy",
    domain: "growth",
    domainLabel: "Growth",
    text: "How often do you walk into a room and experience a complete loss of initial intent—a brief lapse in purposeful continuity?",
    options: [
      { label: "Never.", score: 4 },
      { label: "Occasionally.", score: 14 },
      { label: "Regularly. It's a standard feature of my day.", score: 22 },
      { label: "I'm experiencing an intent-lapse right now.", score: 25 },
    ],
  },

  // ── SECURITY ─────────────────────────────────────────────────────────────────
  {
    id: "tether",
    domain: "security",
    domainLabel: "Security",
    text: "To what extent is your sense of personal identity tethered to your current level of material security?",
    options: [
      { label: "Highly. Stability is core to who I am.", score: 6 },
      { label: "Somewhat. It provides my foundation.", score: 14 },
      { label: "Low. My identity is largely independent of assets.", score: 20 },
      { label: "Not at all. I am essentially detached.", score: 25 },
    ],
  },
  {
    id: "digital_drift",
    domain: "security",
    domainLabel: "Security",
    text: "How many times have you checked a digital interface in the last hour without a predefined objective?",
    options: [
      { label: "Zero. I have strict digital hygiene.", score: 4 },
      { label: "Once or twice.", score: 12 },
      { label: "Several times. It's a compulsive drift.", score: 22 },
      { label: "I am stuck in a drift-cycle currently.", score: 25 },
    ],
  },
];

const MAX_SCORE = QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.score)),
  0
);

const DOMAIN_ORDER = ["body", "mind", "purpose", "connection", "growth", "security"];

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

  // Guard: if somehow out of bounds, render nothing
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
    }, 280);
  }

  function submit(finalAnswers: Record<string, number>) {
    const total = QUESTIONS.reduce((sum, q) => {
      const idx = finalAnswers[q.id];
      return sum + (idx !== undefined ? q.options[idx].score : 0);
    }, 0);
    const score = Math.round((total / MAX_SCORE) * 100);

    const formatted: FormattedAnswer[] = DOMAIN_ORDER.flatMap((domain) =>
      QUESTIONS.filter((q) => q.domain === domain).map((q) => ({
        domain: q.domain,
        question: q.text,
        answer:
          finalAnswers[q.id] !== undefined
            ? q.options[finalAnswers[q.id]].label
            : "No answer provided",
      }))
    );

    onComplete(score, formatted);
  }

  // Domain color map (subtle, matches site palette)
  const domainColors: Record<string, string> = {
    body:       "#4e7c5f",
    mind:       "#5b5ea6",
    purpose:    "#b5752a",
    connection: "#b5495a",
    growth:     "#2a7ab5",
    security:   "#2a9ab5",
  };

  return (
    <div className="max-w-lg">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: domainColors[current.domain] }}
            />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#1A1A1A]/40">
              {current.domainLabel}
            </span>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-[#1A1A1A]/30">
            {currentIdx + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div className="h-px bg-[#1A1A1A]/8 overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: domainColors[current.domain],
            }}
          />
        </div>
      </div>

      {/* Question */}
      <p className="text-base text-[#1A1A1A] leading-relaxed mb-6">
        {current.text}
      </p>

      {/* Options */}
      <div className="space-y-2">
        {current.options.map((opt, idx) => {
          const selected = answers[current.id] === idx;
          return (
            <button
              key={idx}
              onClick={() => selectOption(idx)}
              disabled={advancing && !selected}
              className={`w-full text-left text-sm px-4 py-3 border transition-all ${
                selected
                  ? "border-[#1B2E4B] bg-[#1B2E4B] text-white"
                  : "border-[#1A1A1A]/12 text-[#1A1A1A]/65 hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A] bg-white"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Back */}
      {currentIdx > 0 && (
        <button
          onClick={() => setCurrentIdx((i) => i - 1)}
          className="mt-6 text-xs text-[#1A1A1A]/35 hover:text-[#1A1A1A]/60 transition-colors tracking-wide"
        >
          ← Previous question
        </button>
      )}
    </div>
  );
}
