import { useState } from "react";
import { DATABASE_TYPES, TYPE_QUIZ, type DatabaseType } from "./types";

export function Demo() {
  const [answers, setAnswers] = useState<Record<number, DatabaseType>>({});
  const answeredCount = Object.keys(answers).length;
  const correctCount = TYPE_QUIZ.filter((item) => answers[item.id] === item.answer).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-400">
          Для каждого сценария выбери вид базы данных, который ему реально нужен.
        </p>
        <span className="rounded-md bg-slate-800/60 px-3 py-1 font-mono text-xs text-slate-300">
          верно: {correctCount} / {answeredCount || "?"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TYPE_QUIZ.map((item) => (
          <QuizCard
            key={item.id}
            prompt={item.prompt}
            answer={item.answer}
            explanation={item.explanation}
            selected={answers[item.id]}
            onSelect={(value) => setAnswers((prev) => ({ ...prev, [item.id]: value }))}
          />
        ))}
      </div>
    </div>
  );
}

function QuizCard({
  prompt,
  answer,
  explanation,
  selected,
  onSelect,
}: {
  prompt: string;
  answer: DatabaseType;
  explanation: string;
  selected: DatabaseType | undefined;
  onSelect: (value: DatabaseType) => void;
}) {
  const answered = selected !== undefined;
  const isCorrect = selected === answer;

  return (
    <div
      className={[
        "rounded-lg border p-4 transition-colors",
        !answered
          ? "border-slate-700 bg-slate-900/50"
          : isCorrect
            ? "border-emerald-500 bg-emerald-950/20"
            : "border-rose-500 bg-rose-950/20",
      ].join(" ")}
    >
      <p className="text-sm text-slate-200">{prompt}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {DATABASE_TYPES.map((opt) => {
          const isSelected = selected === opt.id;
          const isTheAnswer = opt.id === answer;
          let tone =
            "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white";
          if (answered && isTheAnswer) {
            tone = "border-emerald-500 bg-emerald-600/20 text-emerald-300";
          } else if (isSelected && !isTheAnswer) {
            tone = "border-rose-500 bg-rose-600/20 text-rose-300";
          }
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              title={opt.examples}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${tone}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {answered && (
        <p className="mt-3 text-xs text-slate-400">
          {isCorrect ? "✅ " : "❌ "}
          {explanation}
        </p>
      )}
    </div>
  );
}
