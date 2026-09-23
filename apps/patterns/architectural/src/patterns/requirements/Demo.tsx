import { useState } from "react";
import { REQUIREMENTS_QUIZ, REQUIREMENT_OPTIONS, type RequirementType } from "./requirements";

export function Demo() {
  const [answers, setAnswers] = useState<Record<number, RequirementType>>({});
  const answeredCount = Object.keys(answers).length;
  const correctCount = REQUIREMENTS_QUIZ.filter((item) => answers[item.id] === item.answer).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-400">
          Каждое требование — функциональное (что делает система) или нефункциональное (каким свойством обладает)?
        </p>
        <span className="rounded-md bg-slate-800/60 px-3 py-1 font-mono text-xs text-slate-300">
          верно: {correctCount} / {answeredCount || "?"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REQUIREMENTS_QUIZ.map((item) => {
          const selected = answers[item.id];
          const answered = selected !== undefined;
          const isCorrect = selected === item.answer;
          return (
            <div
              key={item.id}
              className={[
                "rounded-lg border p-4 transition-colors",
                !answered
                  ? "border-slate-700 bg-slate-900/50"
                  : isCorrect
                    ? "border-emerald-500 bg-emerald-950/20"
                    : "border-rose-500 bg-rose-950/20",
              ].join(" ")}
            >
              <p className="text-sm text-slate-200">{item.prompt}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {REQUIREMENT_OPTIONS.map((opt) => {
                  const isSelected = selected === opt.id;
                  const isTheAnswer = opt.id === item.answer;
                  let tone = "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white";
                  if (answered && isTheAnswer) {
                    tone = "border-emerald-500 bg-emerald-600/20 text-emerald-300";
                  } else if (isSelected && !isTheAnswer) {
                    tone = "border-rose-500 bg-rose-600/20 text-rose-300";
                  }
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: opt.id }))}
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
                  {item.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
