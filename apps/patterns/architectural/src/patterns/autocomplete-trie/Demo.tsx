import { useMemo, useState } from "react";
import { matchPrefix } from "./trie";
import { TrieDiagram } from "./TrieDiagram";

const PRESETS = ["п", "по", "прив", "май"];

export function Demo() {
  const [prefix, setPrefix] = useState("п");
  const match = useMemo(() => matchPrefix(prefix), [prefix]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Начни вводить слово — подсветится путь по дереву, а ниже появятся подсказки, отсортированные по популярности.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="Введи префикс, напр. «п»"
          className="w-56 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setPrefix(p)}
              className="rounded-full border border-slate-700 px-3 py-1 font-mono text-xs text-slate-300 hover:border-slate-500 hover:text-white"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <TrieDiagram highlighted={match.highlightedNodeIds} />

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">Подсказки (по убыванию популярности)</p>
        {match.suggestions.length === 0 ? (
          <p className="text-sm text-slate-600">Совпадений нет.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {match.suggestions.map((s) => (
              <span
                key={s.word}
                className="rounded-md border border-indigo-500 bg-indigo-950/40 px-3 py-1.5 font-mono text-sm text-indigo-200"
              >
                {s.word} <span className="text-indigo-400">×{s.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
