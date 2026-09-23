import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { DEBOUNCE_MS, THROTTLE_MS, createDebouncer, createThrottler } from "./throttle";

const WINDOW_MS = 6000;

export function Demo() {
  const [raw, setRaw] = useState<number[]>([]);
  const [throttled, setThrottled] = useState<number[]>([]);
  const [debounced, setDebounced] = useState<number[]>([]);
  const startRef = useRef<number | null>(null);

  const throttlerRef = useRef(createThrottler(THROTTLE_MS, () => setThrottled((p) => [...p, elapsed()])));
  const debouncerRef = useRef(createDebouncer(DEBOUNCE_MS, () => setDebounced((p) => [...p, elapsed()])));

  function elapsed() {
    if (startRef.current === null) startRef.current = Date.now();
    return Math.min(WINDOW_MS, Date.now() - startRef.current);
  }

  const handleClick = () => {
    setRaw((p) => [...p, elapsed()]);
    throttlerRef.current.trigger();
    debouncerRef.current.trigger();
  };

  const handleBurst = () => {
    // Имитируем частую печать: 12 "нажатий" со случайными маленькими паузами.
    let delay = 0;
    for (let i = 0; i < 12; i++) {
      delay += 60 + Math.random() * 120;
      setTimeout(handleClick, delay);
    }
  };

  const handleReset = () => {
    startRef.current = null;
    setRaw([]);
    setThrottled([]);
    setDebounced([]);
    throttlerRef.current.reset();
    debouncerRef.current.cancel();
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Жми «Клик» быстро подряд (или запусти «Серию кликов») и смотри, как по-разному реагируют
        throttle и debounce на один и тот же поток событий.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleClick}
          className="rounded-md border border-indigo-500 bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Клик
        </button>
        <button
          onClick={handleBurst}
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
        >
          ⚡ Серия кликов
        </button>
        <button
          onClick={handleReset}
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
        >
          ⏮ Сброс
        </button>
      </div>

      <div className="space-y-4">
        <Timeline label="Все клики" marks={raw} color="rgb(100 116 139)" count={raw.length} />
        <Timeline
          label={`Throttle (не чаще ${THROTTLE_MS}мс)`}
          marks={throttled}
          color="rgb(99 102 241)"
          count={throttled.length}
        />
        <Timeline
          label={`Debounce (через ${DEBOUNCE_MS}мс тишины)`}
          marks={debounced}
          color="rgb(52 211 153)"
          count={debounced.length}
        />
      </div>
    </div>
  );
}

function Timeline({
  label,
  marks,
  color,
  count,
}: {
  label: string;
  marks: number[];
  color: string;
  count: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="font-mono text-xs text-slate-500">вызовов: {count}</span>
      </div>
      <div className="relative h-8 rounded-md border border-slate-800 bg-slate-900/50">
        {marks.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${(t / WINDOW_MS) * 100}%`, backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
