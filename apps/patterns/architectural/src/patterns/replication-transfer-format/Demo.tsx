import { useState } from "react";
import {
  FORMAT_OPTIONS,
  FORMAT_QUIZ,
  LEVEL_OPTIONS,
  LEVEL_QUIZ,
  SOURCE_OPTIONS,
  SOURCE_QUIZ,
  type QuizItem,
} from "./format";

type Tab = "source" | "format" | "level";

const TABS: { id: Tab; label: string; hint: string }[] = [
  {
    id: "source",
    label: "Push / Pull",
    hint: "Кто инициирует передачу изменения — мастер сам рассылает, или реплика сама забирает?",
  },
  {
    id: "format",
    label: "Statement / Row / Mixed",
    hint: "Что именно едет по сети — готовый SQL-запрос или уже готовые изменённые строки?",
  },
  {
    id: "level",
    label: "Логическая / Физическая",
    hint: "На каком уровне работает репликация — с содержимым строк, или со страницами на диске?",
  },
];

export function Demo() {
  const [tab, setTab] = useState<Tab>("source");

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap rounded-lg border border-slate-700 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              t.id === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "source" && (
        <Quiz key="source" options={SOURCE_OPTIONS} items={SOURCE_QUIZ} hint={TABS[0].hint} />
      )}
      {tab === "format" && (
        <Quiz key="format" options={FORMAT_OPTIONS} items={FORMAT_QUIZ} hint={TABS[1].hint} />
      )}
      {tab === "level" && (
        <Quiz key="level" options={LEVEL_OPTIONS} items={LEVEL_QUIZ} hint={TABS[2].hint} />
      )}
    </div>
  );
}

function Quiz<T extends string>({
  options,
  items,
  hint,
}: {
  options: { id: T; label: string }[];
  items: QuizItem<T>[];
  hint: string;
}) {
  const [answers, setAnswers] = useState<Record<number, T>>({});
  const answeredCount = Object.keys(answers).length;
  const correctCount = items.filter((item) => answers[item.id] === item.answer).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-400">{hint}</p>
        <span className="rounded-md bg-slate-800/60 px-3 py-1 font-mono text-xs text-slate-300">
          верно: {correctCount} / {answeredCount || "?"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <QuizCard
            key={item.id}
            item={item}
            options={options}
            selected={answers[item.id]}
            onSelect={(value) => setAnswers((prev) => ({ ...prev, [item.id]: value }))}
          />
        ))}
      </div>
    </div>
  );
}

function QuizCard<T extends string>({
  item,
  options,
  selected,
  onSelect,
}: {
  item: QuizItem<T>;
  options: { id: T; label: string }[];
  selected: T | undefined;
  onSelect: (value: T) => void;
}) {
  const answered = selected !== undefined;
  const isCorrect = selected === item.answer;

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
      <p className="text-sm text-slate-200">{item.prompt}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
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
              onClick={() => onSelect(opt.id)}
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
}
