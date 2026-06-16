import { useEffect, useRef, useState } from "react";
import { Subject } from "./observer";

/**
 * Табло-наблюдатель. Оно НЕ получает температуру через props —
 * вместо этого подписывается на субъект и обновляет себя само.
 * В этом вся суть паттерна: источник не знает, кто и как его слушает.
 */
function TemperatureDisplay({
  title,
  subject,
}: {
  title: string;
  subject: Subject<number>;
}) {
  const [temp, setTemp] = useState(() => subject.getValue());

  useEffect(() => {
    // subscribe возвращает функцию отписки — отдаём её как cleanup.
    return subject.subscribe({ update: setTemp });
  }, [subject]);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-white">{temp}°C</p>
    </div>
  );
}

/** Шкала-наблюдатель: показывает ту же температуру в виде полоски. */
function TemperatureBar({ subject }: { subject: Subject<number> }) {
  const [temp, setTemp] = useState(() => subject.getValue());

  useEffect(() => subject.subscribe({ update: setTemp }), [subject]);

  // переводим диапазон -10..40 °C в проценты ширины (0..100)
  const ratio = (temp + 10) / 50;
  const percent = Math.min(100, Math.max(0, ratio * 100));

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">Шкала</p>
      <p className="mt-1 text-3xl font-bold text-white">{temp}°C</p>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-indigo-500 transition-[width] duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function Demo() {
  // Субъект создаём один раз и храним в ref, чтобы он не пересоздавался.
  const subjectRef = useRef<Subject<number>>(null);
  if (subjectRef.current === null) {
    subjectRef.current = new Subject<number>(20);
  }
  const subject = subjectRef.current;

  // temp — состояние "пульта управления". Табло получают значение НЕ отсюда,
  // а через подписку — поэтому setTemp дергает и subject.setValue.
  const [temp, setTemp] = useState(20);
  const [showCard, setShowCard] = useState(true);
  const [showBar, setShowBar] = useState(true);

  // Счётчик подписчиков. Синхронизируем ПОСЛЕ рендера: к этому моменту
  // эффекты табло уже отработали (подписались/отписались), поэтому
  // subject.observerCount показывает актуальное число.
  const [observerCount, setObserverCount] = useState(0);
  useEffect(() => {
    setObserverCount(subject.observerCount);
  });

  const changeTemp = (next: number) => {
    const clamped = Math.min(40, Math.max(-10, next));
    setTemp(clamped);
    subject.setValue(clamped); // уведомляем всех подписчиков
  };

  return (
    <div className="space-y-6">
      {/* Пульт управления (субъект) */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Метеостанция</p>
            <p className="text-xs text-slate-500">
              источник (Subject) · подписчиков: {observerCount}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeTemp(temp - 1)}
              className="h-9 w-9 rounded bg-slate-800 text-lg text-white hover:bg-slate-700"
            >
              −
            </button>
            <span className="w-16 text-center text-xl font-bold text-white">
              {temp}°C
            </span>
            <button
              onClick={() => changeTemp(temp + 1)}
              className="h-9 w-9 rounded bg-slate-800 text-lg text-white hover:bg-slate-700"
            >
              +
            </button>
          </div>
        </div>

        <input
          type="range"
          min={-10}
          max={40}
          value={temp}
          onChange={(e) => changeTemp(Number(e.target.value))}
          className="mt-4 w-full accent-indigo-500"
        />
      </div>

      {/* Тумблеры: добавить/убрать табло = подписать/отписать наблюдателя */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showCard}
            onChange={(e) => setShowCard(e.target.checked)}
            className="accent-indigo-500"
          />
          Табло «температура»
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showBar}
            onChange={(e) => setShowBar(e.target.checked)}
            className="accent-indigo-500"
          />
          Табло «шкала»
        </label>
      </div>

      {/* Наблюдатели. Появление/исчезновение = подписка/отписка. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {showCard && (
          <TemperatureDisplay title="Температура" subject={subject} />
        )}
        {showBar && <TemperatureBar subject={subject} />}
      </div>
    </div>
  );
}
