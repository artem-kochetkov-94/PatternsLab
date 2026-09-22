import { motion } from "framer-motion";
import {
  SERVICE_LABELS,
  SERVICE_TONE,
  TRACE_TOTAL_MS,
  spanDepth,
  type TraceSpan,
} from "./tracing";

const TONE_BAR: Record<string, string> = {
  indigo: "bg-indigo-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};
const TONE_TEXT: Record<string, string> = {
  indigo: "text-indigo-300",
  sky: "text-sky-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
};

/** Столько секунд идёт анимация "роста" одного бара — нужно и Demo.tsx. */
export const BAR_GROW_DURATION = 0.6;

/**
 * Водопадная диаграмма (как в Jaeger): каждая строка — спан, отступ слева
 * по глубине вложенности, ширина и позиция бара пропорциональны реальному
 * времени начала/длительности относительно всего трейса. Спаны появляются
 * по одному — именно ЭТО плеер в Demo.tsx и листает.
 */
export function Waterfall({ spans }: { spans: TraceSpan[] }) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      {/* Шкала времени. */}
      <div className="flex justify-between font-mono text-[10px] text-slate-600">
        <span>0мс</span>
        <span>{Math.round(TRACE_TOTAL_MS / 2)}мс</span>
        <span>{TRACE_TOTAL_MS}мс</span>
      </div>

      <div className="space-y-2">
        {spans.map((span) => {
          const depth = spanDepth(span);
          const leftPct = (span.startMs / TRACE_TOTAL_MS) * 100;
          const widthPct = (span.durationMs / TRACE_TOTAL_MS) * 100;
          const tone = SERVICE_TONE[span.service];

          return (
            <div key={span.id} className="flex items-center gap-3">
              <div
                className="flex w-48 shrink-0 items-center gap-1.5 overflow-hidden"
                style={{ paddingLeft: depth * 16 }}
              >
                <span className={`shrink-0 text-[10px] font-bold uppercase ${TONE_TEXT[tone]}`}>
                  {SERVICE_LABELS[span.service]}
                </span>
              </div>
              <div className="relative h-6 flex-1 rounded bg-slate-800/60">
                <motion.div
                  className={`absolute top-0 h-full rounded ${TONE_BAR[tone]}`}
                  style={{ left: `${leftPct}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: BAR_GROW_DURATION, ease: "easeOut" }}
                />
                <span
                  className="absolute top-0 flex h-full items-center whitespace-nowrap px-2 font-mono text-[10px] text-slate-300"
                  style={{ left: `${Math.min(leftPct + widthPct, 60)}%` }}
                >
                  {span.operation} · {span.durationMs}мс
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
