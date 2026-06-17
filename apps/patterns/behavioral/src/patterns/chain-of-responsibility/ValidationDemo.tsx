import { useEffect, useRef, useState } from "react";
import {
  Validator,
  buildChain,
  validate,
  type Form,
  type Mode,
  type ValidationResult,
} from "./validation";

/**
 * Цепочка валидаторов формы. Один и тот же набор — оба примера ниже
 * (fail-fast и collect-all) используют его, меняется только режим.
 */
const VALIDATORS = [
  new Validator("Имя заполнено", (f) =>
    f.name.trim() === "" ? "Укажите имя" : null,
  ),
  new Validator("E-mail корректный", (f) =>
    /.+@.+\..+/.test(f.email) ? null : "E-mail выглядит неправильно",
  ),
  new Validator("Возраст 18+", (f) =>
    f.age >= 18 ? null : "Возраст должен быть не меньше 18",
  ),
];

const chainHead = buildChain(VALIDATORS);

/** Подписи и формулировки, зависящие от режима. */
const MODE_INFO: Record<Mode, { caption: string }> = {
  "fail-fast": {
    caption:
      "Идём по цепочке и обрываемся на ПЕРВОЙ непройденной проверке — остальные не выполняются.",
  },
  "collect-all": {
    caption:
      "Проходим цепочку до конца, даже если проверки падают, и собираем ВСЕ ошибки сразу.",
  },
};

export function ValidationDemo({ mode }: { mode: Mode }) {
  const [form, setForm] = useState<Form>({ name: "", email: "petya", age: 16 });

  const [result, setResult] = useState<ValidationResult | null>(null);
  // Сколько шагов цепочки уже "проиграла" анимация.
  const [shownSteps, setShownSteps] = useState(0);

  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  // Сбрасываем результат при смене режима — чтобы примеры не путались.
  useEffect(() => {
    clearTimers();
    setResult(null);
    setShownSteps(0);
  }, [mode]);

  const run = () => {
    clearTimers();
    const res = validate(chainHead, form, mode);
    setResult(res);
    setShownSteps(0);

    // Проигрываем пройденные звенья по одному.
    res.steps.forEach((_, i) => {
      const id = window.setTimeout(() => setShownSteps(i + 1), (i + 1) * 600);
      timers.current.push(id);
    });
  };

  const finished = result !== null && shownSteps >= result.steps.length;

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">{MODE_INFO[mode].caption}</p>

      {/* Форма — её и прогоняем по цепочке проверок. */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-700 bg-slate-900 p-5 sm:grid-cols-3">
        <label className="text-xs text-slate-400">
          Имя
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            className="mt-1 w-full rounded bg-slate-800 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>
        <label className="text-xs text-slate-400">
          E-mail
          <input
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            className="mt-1 w-full rounded bg-slate-800 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>
        <label className="text-xs text-slate-400">
          Возраст
          <input
            type="number"
            value={form.age}
            onChange={(e) => set({ age: Number(e.target.value) })}
            className="mt-1 w-full rounded bg-slate-800 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>
      </div>

      <button
        onClick={run}
        className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Проверить форму
      </button>

      {/* Цепочка проверок. */}
      <div className="space-y-3">
        {VALIDATORS.map((validator, i) => {
          // steps[i] есть только у звеньев, до которых дошла цепочка.
          const step = result?.steps[i];
          const shown = step !== undefined && shownSteps > i;
          // Звено, которого нет в steps (fail-fast оборвался раньше).
          const skipped = finished && step === undefined;

          return (
            <div
              key={validator.title}
              className={[
                "flex items-center justify-between rounded-lg border p-4 transition-colors duration-300",
                shown && step.status === "ok"
                  ? "border-emerald-500 bg-emerald-950"
                  : shown && step.status === "error"
                    ? "border-rose-500 bg-rose-950"
                    : skipped
                      ? "border-slate-800 bg-slate-900/40 opacity-50"
                      : "border-slate-700 bg-slate-900",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-white">
                {validator.title}
              </p>
              {shown && step.status === "ok" && (
                <span className="text-sm font-semibold text-emerald-400">
                  ✓ пройдено
                </span>
              )}
              {shown && step.status === "error" && (
                <span className="text-sm text-rose-300">✕ {step.message}</span>
              )}
              {skipped && (
                <span className="text-xs text-slate-500">не выполнялось</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Итог. */}
      {finished && result && (
        <div
          className={[
            "rounded-lg border p-4 text-sm",
            result.valid
              ? "border-emerald-600 bg-emerald-950 text-emerald-200"
              : "border-rose-600 bg-rose-950 text-rose-200",
          ].join(" ")}
        >
          {result.valid ? (
            "Форма прошла все проверки ✓"
          ) : (
            <>
              <p className="font-semibold">
                Форма не прошла проверку ({result.errors.length}{" "}
                {mode === "fail-fast" ? "— остановились на первой" : "ошибок"}):
              </p>
              <ul className="mt-1 list-disc pl-5">
                {result.errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
