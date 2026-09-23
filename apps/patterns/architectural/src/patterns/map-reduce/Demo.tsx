import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  CUT_LINES,
  INPUT_TEXT,
  MAP_OUTPUT,
  PHASES,
  REDUCE_OUTPUT,
  SHUFFLE_GROUPS,
  type MapReducePhase,
} from "./mapreduce";

const PHASE_ORDER: MapReducePhase[] = ["input", "cut", "map", "shuffle", "reduce"];

export function Demo() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const atEnd = stepIndex >= PHASE_ORDER.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), 1600);
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepIndex]);

  const visible = new Set(PHASE_ORDER.slice(0, stepIndex + 1));
  const phase = PHASES[stepIndex];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        {visible.has("input") && (
          <Column title="Input">
            <Box>{INPUT_TEXT.split("\n").join(" / ")}</Box>
          </Column>
        )}

        {visible.has("cut") && (
          <Column title="Cut">
            {CUT_LINES.map((line, i) => (
              <Box key={i}>{line}</Box>
            ))}
          </Column>
        )}

        {visible.has("map") && (
          <Column title="Map">
            {MAP_OUTPUT.map((group, i) => (
              <Box key={i}>{group.map((p) => `${p.word} = ${p.count}`).join("\n")}</Box>
            ))}
          </Column>
        )}

        {visible.has("shuffle") && (
          <Column title="Shuffle">
            {SHUFFLE_GROUPS.map((g) => (
              <Box key={g.word}>
                {g.word} = {g.counts.join(", ")}
              </Box>
            ))}
          </Column>
        )}

        {visible.has("reduce") && (
          <Column title="Reduce">
            {REDUCE_OUTPUT.map((p) => (
              <Box key={p.word} highlight>
                {p.word} = {p.count}
              </Box>
            ))}
          </Column>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="font-mono text-xs text-slate-500">{phase.label}</p>
        <p className="min-h-[3.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
          {phase.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setStepIndex(0);
            setPlaying(false);
          }}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
        >
          ⏮ Сброс
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStepIndex((i) => Math.max(0, i - 1));
          }}
          disabled={stepIndex === 0}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40"
        >
          ◀ Назад
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="rounded-md border border-indigo-500 bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          {playing ? "⏸ Пауза" : "▶ Авто"}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStepIndex((i) => Math.min(PHASE_ORDER.length - 1, i + 1));
          }}
          disabled={atEnd}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40"
        >
          Вперёд ▶
        </button>
        <span className="ml-auto font-mono text-xs text-slate-500">
          {stepIndex + 1} / {PHASE_ORDER.length}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={PHASE_ORDER.length - 1}
        value={stepIndex}
        onChange={(e) => {
          setPlaying(false);
          setStepIndex(Number(e.target.value));
        }}
        className="w-full accent-indigo-500"
      />
    </div>
  );
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="flex min-w-[140px] flex-1 flex-col gap-2"
    >
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      {children}
    </motion.div>
  );
}

function Box({ children, highlight }: { children: ReactNode; highlight?: boolean }) {
  return (
    <div
      className={[
        "whitespace-pre-line rounded-md border px-3 py-2 text-center font-mono text-xs",
        highlight
          ? "border-emerald-500 bg-emerald-950/30 text-emerald-300"
          : "border-slate-700 bg-slate-800/60 text-slate-300",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
