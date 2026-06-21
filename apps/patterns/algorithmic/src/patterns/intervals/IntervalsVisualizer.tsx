import { motion } from "framer-motion";
import type { Interval, IntervalStep } from "./intervals";
import { intervalLabel } from "./intervals";

/**
 * Чистая отрисовка ОДНОГО кадра развёртки. Никакой логики — только текущий
 * шаг (`step`) превращается в картинку: временная шкала с барами встреч,
 * вертикальная «линия развёртки» (Framer Motion плавно ведёт её по времени)
 * и счётчики текущей загрузки и пика (= минимум комнат).
 */
export function IntervalsVisualizer({
  intervals,
  step,
}: {
  intervals: Interval[];
  step: IntervalStep;
}) {
  // Временная ось: от самого раннего начала до самого позднего конца.
  const minT = Math.min(...intervals.map((it) => it.start));
  const maxT = Math.max(...intervals.map((it) => it.end));
  const span = Math.max(1, maxT - minT);

  // Перевод момента времени в проценты ширины шкалы.
  const pct = (t: number) => ((t - minT) / span) * 100;

  const activeSet = new Set(step.activeIds);

  return (
    <div className="space-y-6">
      {/* Счётчики: текущая загрузка и пик (ответ). */}
      <div className="flex flex-wrap gap-3">
        <Counter label="Активно сейчас" value={step.active} tone="sky" />
        <Counter
          label="Пик = нужно комнат"
          value={step.maxActive}
          tone="emerald"
          big
        />
      </div>

      {/* Шкала с барами и линией развёртки. */}
      <div className="relative overflow-x-auto">
        <div className="relative min-w-[480px] py-2">
          {/* Линия развёртки. */}
          <motion.div
            className="absolute top-0 bottom-6 z-10 w-0.5 bg-amber-400"
            style={{ left: `${pct(step.time)}%` }}
            animate={{ left: `${pct(step.time)}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <span className="absolute -top-1 left-1 whitespace-nowrap rounded bg-amber-400 px-1.5 text-[10px] font-bold text-slate-900">
              t = {step.time}
            </span>
          </motion.div>

          {/* По бару на каждую встречу. */}
          <div className="space-y-2">
            {intervals.map((it) => {
              const isActive = activeSet.has(it.id);
              const isTriggered = it.id === step.intervalId;
              const finished = step.time >= it.end && !isActive;

              return (
                <div key={it.id} className="relative h-9">
                  {/* Фоновая дорожка. */}
                  <div className="absolute inset-0 rounded bg-slate-900" />
                  <motion.div
                    className={[
                      "absolute top-0 flex h-9 items-center justify-center rounded border text-xs font-semibold",
                      isActive
                        ? "border-sky-400 bg-sky-500/25 text-white"
                        : finished
                          ? "border-slate-800 bg-slate-800/40 text-slate-600"
                          : "border-slate-700 bg-slate-800 text-slate-300",
                      isTriggered ? "ring-2 ring-amber-400" : "",
                    ].join(" ")}
                    style={{
                      left: `${pct(it.start)}%`,
                      width: `${pct(it.end) - pct(it.start)}%`,
                    }}
                    animate={isTriggered ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {intervalLabel(it.id)} [{it.start}, {it.end})
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Подписи краёв оси. */}
          <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-600">
            <span>{minT}</span>
            <span>{maxT}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Маленькое табло-счётчик. */
function Counter({
  label,
  value,
  tone,
  big = false,
}: {
  label: string;
  value: number;
  tone: "sky" | "emerald";
  big?: boolean;
}) {
  const tones = {
    sky: "border-sky-700 bg-sky-950/40 text-sky-300",
    emerald: "border-emerald-600 bg-emerald-950/40 text-emerald-300",
  };
  return (
    <div
      className={[
        "rounded-lg border px-4 py-2",
        tones[tone],
        big ? "min-w-[10rem]" : "",
      ].join(" ")}
    >
      <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
      <p
        className={[
          "font-mono font-bold tabular-nums",
          big ? "text-2xl text-white" : "text-xl",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
