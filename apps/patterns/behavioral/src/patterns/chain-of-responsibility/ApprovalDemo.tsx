import { useEffect, useRef, useState } from "react";
import { Approver, buildChain, type Resolution } from "./approval";

/**
 * Пример стратегии "first-match": заявку одобряет ПЕРВЫЙ согласующий,
 * у которого хватает лимита, — дальше цепочка не идёт.
 *
 * Согласующие выстроены по возрастанию лимита.
 */
const APPROVERS = [
  new Approver("Тимлид", 5_000),
  new Approver("Менеджер", 50_000),
  new Approver("Финдиректор", 500_000),
];

/** Цепочку собираем один раз на модуль — она неизменна. */
const chainHead = buildChain(APPROVERS);

const formatMoney = (value: number) => `${value.toLocaleString("ru-RU")} ₽`;

export function ApprovalDemo() {
  const [amount, setAmount] = useState(30_000);

  // Итог прохождения по цепочке (заполняется после "Отправить").
  const [resolution, setResolution] = useState<Resolution | null>(null);
  // Индекс звена, до которого "дошла" анимация. -1 — ещё не запускали.
  const [activeStep, setActiveStep] = useState(-1);

  // Чистим таймеры анимации при размонтировании / новом запуске.
  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const send = () => {
    clearTimers();

    // Прогоняем запрос по цепочке — получаем готовый маршрут...
    const result = chainHead.handle({ amount, purpose: "Закупка" });
    setResolution(result);
    setActiveStep(-1);

    // ...и проигрываем его шаг за шагом, чтобы видеть передачу по цепочке.
    result.steps.forEach((_, i) => {
      const id = window.setTimeout(() => setActiveStep(i), (i + 1) * 600);
      timers.current.push(id);
    });
  };

  // Анимация завершена, когда подсветили последний пройденный шаг.
  const finished =
    resolution !== null && activeStep >= resolution.steps.length - 1;

  return (
    <div className="space-y-6">
      {/* Пульт: задаём сумму заявки и отправляем в цепочку. */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
        <p className="text-sm font-semibold text-white">Заявка на расход</p>
        <p className="text-xs text-slate-500">
          отправитель не знает, кто одобрит — просто отдаёт запрос в цепочку
        </p>

        <div className="mt-4 flex items-center gap-3">
          <span className="w-28 text-right text-2xl font-bold text-white">
            {formatMoney(amount)}
          </span>
          <input
            type="range"
            min={1_000}
            max={700_000}
            step={1_000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <button
          onClick={send}
          className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Отправить на согласование
        </button>
      </div>

      {/* Сама цепочка согласующих. */}
      <div className="space-y-3">
        {APPROVERS.map((approver, i) => {
          const step = resolution?.steps[i];
          // Подсвечиваем звено, только когда анимация до него дошла.
          const reached = step !== undefined && activeStep >= i;
          const isApprover = reached && step.action === "approved";
          const isPassed = reached && step.action === "passed";

          return (
            <div key={approver.title}>
              <div
                className={[
                  "rounded-lg border p-4 transition-colors duration-300",
                  isApprover
                    ? "border-emerald-500 bg-emerald-950"
                    : isPassed
                      ? "border-slate-600 bg-slate-800/60"
                      : "border-slate-700 bg-slate-900",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {approver.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      одобряет до {formatMoney(approver.limit)}
                    </p>
                  </div>
                  {isApprover && (
                    <span className="text-sm font-semibold text-emerald-400">
                      ✓ согласовал
                    </span>
                  )}
                  {isPassed && (
                    <span className="text-sm text-slate-400">
                      передал дальше ↓
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Итог: кто согласовал или отказ. */}
      {finished && resolution && (
        <div
          className={[
            "rounded-lg border p-4 text-sm",
            resolution.approvedBy
              ? "border-emerald-600 bg-emerald-950 text-emerald-200"
              : "border-rose-600 bg-rose-950 text-rose-200",
          ].join(" ")}
        >
          {resolution.approvedBy
            ? `Заявку на ${formatMoney(amount)} согласовал «${resolution.approvedBy}».`
            : `Заявку на ${formatMoney(amount)} никто в цепочке не вправе одобрить — нужен уровень выше.`}
        </div>
      )}
    </div>
  );
}
