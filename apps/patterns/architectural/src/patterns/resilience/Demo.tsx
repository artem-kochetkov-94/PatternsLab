import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BACKPRESSURE_STEPS,
  DEGRADATION_SERVICES,
  RETRY_STEPS,
  type RecommendationHealth,
} from "./resilience";
import { RetryDiagram } from "./RetryDiagram";

type Tab = "retries" | "backpressure" | "degradation";

const TABS: { id: Tab; label: string }[] = [
  { id: "retries", label: "Retries / Backoff" },
  { id: "backpressure", label: "Backpressure" },
  { id: "degradation", label: "Graceful Degradation / Fallback" },
];

export function Demo() {
  const [tab, setTab] = useState<Tab>("retries");

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap rounded-lg border border-slate-700 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              t.id === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "retries" && <RetriesPanel />}
      {tab === "backpressure" && <BackpressurePanel />}
      {tab === "degradation" && <DegradationPanel />}
    </div>
  );
}

function RetriesPanel() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const atEnd = stepIndex >= RETRY_STEPS.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const step = RETRY_STEPS[stepIndex];
    const delay = step.waitMs ? step.waitMs * 4 : 1300;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), delay);
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepIndex]);

  const step = RETRY_STEPS[stepIndex];

  return (
    <div className="space-y-6">
      <RetryDiagram leg={step.leg} eventKey={`${step.id}`} />

      {step.waitMs && (
        <p className="text-center font-mono text-sm text-amber-400">⏱ ждём {step.waitMs}мс</p>
      )}

      <div className="space-y-1.5">
        <p className="font-mono text-xs text-slate-500">{step.label}</p>
        <p className="min-h-[4.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
          {step.description}
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
            setStepIndex((i) => Math.min(RETRY_STEPS.length - 1, i + 1));
          }}
          disabled={atEnd}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40"
        >
          Вперёд ▶
        </button>
        <span className="ml-auto font-mono text-xs text-slate-500">
          {stepIndex + 1} / {RETRY_STEPS.length}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={RETRY_STEPS.length - 1}
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

function BackpressurePanel() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = BACKPRESSURE_STEPS[stepIndex];
  const maxBacklog = Math.max(...BACKPRESSURE_STEPS.map((s) => s.backlog), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-6 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <RateBox label="Service 1" rate={step.incomingRate} />
        <span className="text-slate-600">→</span>
        <div className="flex flex-col items-center gap-2">
          <div className="h-24 w-10 overflow-hidden rounded-md border border-slate-700 bg-slate-800/60">
            <motion.div
              className="w-full bg-amber-500"
              initial={false}
              animate={{ height: `${Math.min(100, (step.backlog / maxBacklog) * 100)}%` }}
              style={{ marginTop: "auto" }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="font-mono text-xs text-slate-400">backlog: {step.backlog}</span>
        </div>
        <span className="text-slate-600">→</span>
        <RateBox label="Service 2" rate={step.processingRate} />
      </div>

      <div className="space-y-1.5">
        <p className="font-mono text-xs text-slate-500">{step.label}</p>
        <p className="min-h-[4.5rem] rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
          {step.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setStepIndex(0)}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
        >
          ⏮ Сброс
        </button>
        <button
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40"
        >
          ◀ Назад
        </button>
        <button
          onClick={() => setStepIndex((i) => Math.min(BACKPRESSURE_STEPS.length - 1, i + 1))}
          disabled={stepIndex === BACKPRESSURE_STEPS.length - 1}
          className="rounded-md border border-indigo-500 bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          Вперёд ▶
        </button>
        <span className="ml-auto font-mono text-xs text-slate-500">
          {stepIndex + 1} / {BACKPRESSURE_STEPS.length}
        </span>
      </div>
    </div>
  );
}

function RateBox({ label, rate }: { label: string; rate: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3">
      <span className="text-sm font-semibold text-white">{label}</span>
      <span className="font-mono text-xs text-slate-400">{rate} r/s</span>
    </div>
  );
}

function DegradationPanel() {
  const [peakLoad, setPeakLoad] = useState(false);
  const [health, setHealth] = useState<RecommendationHealth>("healthy");

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-slate-400">Graceful Degradation — под пиковой нагрузкой отключаем необязательное.</p>
          <button
            onClick={() => setPeakLoad((v) => !v)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              peakLoad
                ? "border-rose-500 bg-rose-600 text-white hover:bg-rose-500"
                : "border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500",
            ].join(" ")}
          >
            {peakLoad ? "🔥 Пиковая нагрузка" : "✅ Обычная нагрузка"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DEGRADATION_SERVICES.map((s) => {
            const disabled = peakLoad && !s.critical;
            return (
              <motion.div
                key={s.id}
                animate={{ opacity: disabled ? 0.35 : 1 }}
                className={[
                  "rounded-lg border px-3 py-3 text-center text-sm font-medium transition-colors",
                  disabled
                    ? "border-rose-800 bg-rose-950/20 text-rose-400 line-through"
                    : "border-slate-700 bg-slate-800/60 text-white",
                ].join(" ")}
              >
                {s.label}
                {!s.critical && <div className="mt-1 text-[10px] uppercase text-slate-500">необязательный</div>}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-slate-400">Fallback — если сервис недоступен, подменяем ответ заглушкой вместо ошибки.</p>
          <button
            onClick={() => setHealth((h) => (h === "healthy" ? "down" : "healthy"))}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              health === "healthy"
                ? "border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500"
                : "border-rose-500 bg-rose-600 text-white hover:bg-rose-500",
            ].join(" ")}
          >
            {health === "healthy" ? "✅ Recommendation здоров" : "✕ Recommendation упал"}
          </button>
        </div>
        <div className="flex items-center justify-center gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <FallbackBox label="Client" />
          <span className="text-slate-600">→</span>
          <FallbackBox label="Proxy" />
          <span className="text-slate-600">→</span>
          <FallbackBox
            label={health === "healthy" ? "Recommendation" : "Dummy"}
            tone={health === "healthy" ? "healthy" : "fallback"}
          />
        </div>
        <p className="mt-3 rounded-md bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
          {health === "healthy"
            ? "Proxy получает честный, персонализированный ответ от Recommendation."
            : "Recommendation недоступен — Proxy отдаёт заранее заготовленный дефолтный ответ (Dummy), лишь бы не вернуть клиенту ошибку."}
        </p>
      </div>
    </div>
  );
}

function FallbackBox({ label, tone }: { label: string; tone?: "healthy" | "fallback" }) {
  const cls =
    tone === "fallback"
      ? "border-amber-500 bg-amber-950/30 text-amber-300"
      : tone === "healthy"
        ? "border-emerald-500 bg-emerald-950/20 text-emerald-300"
        : "border-slate-700 bg-slate-800/60 text-white";
  return (
    <div className={`rounded-lg border px-4 py-3 text-center text-sm font-medium ${cls}`}>{label}</div>
  );
}
