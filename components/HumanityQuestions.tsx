"use client";

import { useState } from "react";

interface Option {
  label: string;
  score: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: "phone",
    text: "How many times have you checked your phone in the last hour without meaning to?",
    options: [
      { label: "Zero. I have discipline.", score: 4 },
      { label: "Once or twice.", score: 12 },
      { label: "Several times. I've lost count.", score: 20 },
      { label: "I'm doing it right now.", score: 25 },
    ],
  },
  {
    id: "regret",
    text: "When did you last do something you immediately regretted?",
    options: [
      { label: "Never. I think before I act.", score: 4 },
      { label: "A few months ago.", score: 12 },
      { label: "This week.", score: 20 },
      { label: "Today.", score: 25 },
    ],
  },
  {
    id: "room",
    text: "Have you ever walked into a room and completely forgotten why?",
    options: [
      { label: "No.", score: 4 },
      { label: "Rarely.", score: 12 },
      { label: "Regularly.", score: 20 },
      { label: "I'm in a room right now and I'm not sure why.", score: 25 },
    ],
  },
  {
    id: "sleep",
    text: "Which best describes your relationship with sleep?",
    options: [
      { label: "Consistent. Same time every night.", score: 4 },
      { label: "Mostly fine, occasional disruptions.", score: 14 },
      { label: "Erratic at best.", score: 20 },
      { label: "What is sleep.", score: 25 },
    ],
  },
  {
    id: "cry",
    text: "Have you ever cried at something you knew was manipulative — an advert, a film, a song?",
    options: [
      { label: "No.", score: 4 },
      { label: "Yes, but I'm not proud of it.", score: 20 },
      { label: "Yes, and I would do it again.", score: 25 },
    ],
  },
  {
    id: "task",
    text: "How often do you start a task and end up doing something entirely different?",
    options: [
      { label: "Never.", score: 4 },
      { label: "Occasionally.", score: 14 },
      { label: "More often than I would like to admit.", score: 25 },
    ],
  },
  {
    id: "beliefs",
    text: "Do you hold any beliefs you cannot rationally justify?",
    options: [
      { label: "No. My views are evidence-based.", score: 4 },
      { label: "Maybe one or two.", score: 14 },
      { label: "Several.", score: 20 },
      { label: "Yes, and I consider this a feature.", score: 25 },
    ],
  },
];

const MAX_SCORE = QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.score)),
  0
);

interface Props {
  onComplete: (score: number) => void;
}

export default function HumanityQuestions({ onComplete }: Props) {
  // answers[questionId] = selected option index
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allAnswered = QUESTIONS.every((q) => q.id in answers);

  function handleSubmit() {
    const total = QUESTIONS.reduce((sum, q) => {
      const idx = answers[q.id];
      return sum + (idx !== undefined ? q.options[idx].score : 0);
    }, 0);
    const score = Math.round((total / MAX_SCORE) * 100);
    onComplete(score);
  }

  return (
    <div className="space-y-8 max-w-lg">
      {QUESTIONS.map((q, i) => (
        <div key={q.id} className="space-y-3">
          <p className="text-sm text-[#1A1A1A] leading-relaxed">
            <span className="font-mono text-[10px] text-[#1A1A1A]/35 mr-2 tracking-widest">
              {String(i + 1).padStart(2, "0")}
            </span>
            {q.text}
          </p>
          <div className="space-y-1.5 pl-5">
            {q.options.map((opt, idx) => {
              const selected = answers[q.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: idx }))
                  }
                  className={`w-full text-left text-sm px-4 py-2.5 border transition-colors ${
                    selected
                      ? "border-[#1B2E4B] bg-[#1B2E4B] text-white"
                      : "border-[#1A1A1A]/15 text-[#1A1A1A]/65 hover:border-[#1A1A1A]/35 hover:text-[#1A1A1A]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-2">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="bg-[#1B2E4B] text-white px-8 py-3 text-sm tracking-wide font-medium hover:bg-[#1B2E4B]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit
        </button>
        {!allAnswered && (
          <p className="text-[10px] text-[#1A1A1A]/35 mt-2 tracking-wide">
            {Object.keys(answers).length} of {QUESTIONS.length} questions answered
          </p>
        )}
      </div>
    </div>
  );
}
