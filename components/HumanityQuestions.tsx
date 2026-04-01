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
    id: "sleep",
    domain: "body",
    domainLabel: "Body",
    text: "Which best describes your relationship with sleep?",
    options: [
      { label: "Consistent. Same time every night.", score: 4 },
      { label: "Mostly fine, occasional disruptions.", score: 14 },
      { label: "Erratic at best.", score: 20 },
      { label: "What is sleep.", score: 25 },
    ],
  },
  {
    id: "energy",
    domain: "body",
    domainLabel: "Body",
    text: "How would you describe your energy on a typical day?",
    options: [
      { label: "Consistent and good.", score: 4 },
      { label: "Generally okay, occasional dips.", score: 12 },
      { label: "Inconsistent — spikes and crashes.", score: 20 },
      { label: "Reliably depleted by mid-afternoon.", score: 25 },
    ],
  },

  // ── MIND ─────────────────────────────────────────────────────────────────────
  {
    id: "overwhelm",
    domain: "mind",
    domainLabel: "Mind",
    text: "How often do you feel genuinely overwhelmed by ordinary demands?",
    options: [
      { label: "Rarely — I manage well.", score: 4 },
      { label: "Occasionally, when things pile up.", score: 12 },
      { label: "Several times a week.", score: 20 },
      { label: "Almost constantly.", score: 25 },
    ],
  },
  {
    id: "beliefs",
    domain: "mind",
    domainLabel: "Mind",
    text: "Do you hold any beliefs you cannot rationally justify?",
    options: [
      { label: "No. My views are evidence-based.", score: 4 },
      { label: "Maybe one or two.", score: 14 },
      { label: "Several.", score: 20 },
      { label: "Yes, and I consider this a feature.", score: 25 },
    ],
  },

  // ── PURPOSE ──────────────────────────────────────────────────────────────────
  {
    id: "waking_hours",
    domain: "purpose",
    domainLabel: "Purpose",
    text: "How satisfied are you with how you spend most of your waking hours?",
    options: [
      { label: "Generally fulfilled.", score: 4 },
      { label: "Mixed — some meaning, some not.", score: 12 },
      { label: "Mostly going through the motions.", score: 20 },
      { label: "Deeply unsatisfied. Something has to change.", score: 25 },
    ],
  },
  {
    id: "task_switch",
    domain: "purpose",
    domainLabel: "Purpose",
    text: "How often do you start a task and end up doing something entirely different?",
    options: [
      { label: "Never.", score: 4 },
      { label: "Occasionally.", score: 14 },
      { label: "More often than I would like to admit.", score: 25 },
    ],
  },

  // ── CONNECTION ───────────────────────────────────────────────────────────────
  {
    id: "cry",
    domain: "connection",
    domainLabel: "Connection",
    text: "Have you ever cried at something you knew was manipulative — an advert, a film, a song?",
    options: [
      { label: "No.", score: 4 },
      { label: "Yes, but I'm not proud of it.", score: 20 },
      { label: "Yes, and I would do it again.", score: 25 },
    ],
  },
  {
    id: "conversation",
    domain: "connection",
    domainLabel: "Connection",
    text: "When did you last have a conversation that genuinely mattered to you?",
    options: [
      { label: "I can't remember.", score: 8 },
      { label: "A few months ago.", score: 14 },
      { label: "This week.", score: 20 },
      { label: "Today.", score: 25 },
    ],
  },

  // ── GROWTH ───────────────────────────────────────────────────────────────────
  {
    id: "room",
    domain: "growth",
    domainLabel: "Growth",
    text: "Have you ever walked into a room and completely forgotten why?",
    options: [
      { label: "No.", score: 4 },
      { label: "Rarely.", score: 12 },
      { label: "Regularly.", score: 20 },
      { label: "I'm in a room right now and I'm not sure why.", score: 25 },
    ],
  },
  {
    id: "learning",
    domain: "growth",
    domainLabel: "Growth",
    text: "When did you last learn something that changed how you see something?",
    options: [
      { label: "I can't remember the last time.", score: 5 },
      { label: "A few months ago.", score: 12 },
      { label: "Recently.", score: 20 },
      { label: "I'm in the middle of it right now.", score: 25 },
    ],
  },

  // ── SECURITY ─────────────────────────────────────────────────────────────────
  {
    id: "money",
    domain: "security",
    domainLabel: "Security",
    text: "How often does money cause you stress?",
    options: [
      { label: "Rarely — I feel financially stable.", score: 4 },
      { label: "Occasionally.", score: 12 },
      { label: "Regularly.", score: 20 },
      { label: "Almost constantly.", score: 25 },
    ],
  },
  {
    id: "phone",
    domain: "security",
    domainLabel: "Security",
    text: "How many times have you checked your phone in the last hour without meaning to?",
    options: [
      { label: "Zero. I have discipline.", score: 4 },
      { label: "Once or twice.", score: 12 },
      { label: "Several times. I've lost count.", score: 20 },
      { label: "I'm doing it right now.", score: 25 },
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
