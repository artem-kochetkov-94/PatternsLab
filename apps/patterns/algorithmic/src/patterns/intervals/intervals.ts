// Работа с интервалами на задаче LeetCode 253 — «Meeting Rooms II».
//
// ВАЖНО: чистый, «боевой» вариант алгоритма лежит в solution.ts — читать
// лучше с него. Этот файл намеренно «шумный»: он складывает КАЖДЫЙ шаг
// развёртки в массив, чтобы пошаговый плеер мог его прокрутить вперёд/назад.
//
// Дано: список встреч, каждая задана отрезком [start, end). Нужно понять,
// какое МИНИМАЛЬНОЕ число переговорок необходимо, чтобы провести их все.
//
// Ключевое наблюдение: минимум комнат равен МАКСИМАЛЬНОМУ числу встреч,
// которые пересекаются в один и тот же момент времени. То есть задача
// сводится к поиску «пика загруженности».
//
// Наивно: для каждого момента считать, сколько встреч его накрывают —
// дорого. Приём «развёртка событий» (sweep line) решает за O(n·log n):
// каждый отрезок превращаем в два события — +1 в точке начала и −1 в точке
// конца, сортируем все события по времени и идём слева направо, держа
// счётчик активных встреч. Максимум этого счётчика и есть ответ.
//
// Тонкость стыковки: встреча [10, 20] и встреча [0, 10] НЕ пересекаются —
// одна заканчивается ровно тогда, когда вторая начинается. Поэтому при
// равном времени событие «конец» (−1) обрабатываем раньше, чем «начало» (+1).

/** Одна встреча: полуинтервал [start, end). `id` — для подсветки в UI. */
export interface Interval {
  id: number;
  start: number;
  end: number;
}

/** Точечное событие развёртки: +1 в начале встречи, −1 в её конце. */
export interface SweepEvent {
  /** Момент времени, в котором происходит событие. */
  time: number;
  /** +1 — открылась встреча, −1 — закрылась. */
  delta: 1 | -1;
  /** id встречи, породившей событие. */
  intervalId: number;
  /** Это «начало» или «конец» отрезка. */
  edge: "start" | "end";
}

/**
 * Один «снимок» состояния алгоритма — всё, что нужно UI для отрисовки кадра.
 * Логика отделена от отображения: трейсер возвращает массив шагов, а плеер
 * просто листает их вперёд/назад.
 */
export interface IntervalStep {
  /** Индекс события, которое только что обработали (−1 — стартовый кадр). */
  eventIndex: number;
  /** Позиция «линии развёртки» на временной оси. */
  time: number;
  /** Что произошло на этом шаге: открытие (+1), закрытие (−1) или старт (0). */
  delta: 1 | -1 | 0;
  /** Сколько встреч активно ПОСЛЕ обработки события (текущая загрузка). */
  active: number;
  /** Бегущий максимум загрузки — это и есть искомое число комнат. */
  maxActive: number;
  /** id активных в данный момент встреч (для подсветки баров). */
  activeIds: number[];
  /** id встречи, чьё событие обработали (для акцента). */
  intervalId: number | null;
  /** Сработала граница начала или конца. */
  edge: "start" | "end" | null;
  /** Человекочитаемое пояснение шага. */
  description: string;
  /** `true` на финальном кадре, когда все события разобраны. */
  done: boolean;
}

/** Подпись встречи буквой: 0 → "A", 1 → "B" … (для текста пояснений). */
export function intervalLabel(id: number): string {
  return String.fromCharCode(65 + id);
}

/**
 * Превращает список встреч в отсортированный поток событий развёртки.
 * Вынесено отдельно, чтобы визуализация могла показать «ленту событий».
 */
export function buildEvents(intervals: Interval[]): SweepEvent[] {
  const events: SweepEvent[] = [];
  for (const it of intervals) {
    events.push({ time: it.start, delta: 1, intervalId: it.id, edge: "start" });
    events.push({ time: it.end, delta: -1, intervalId: it.id, edge: "end" });
  }
  // Сортируем по времени; при равенстве «конец» (delta = −1) идёт раньше
  // «начала» (delta = +1), иначе встык стоящие встречи ложно «пересекутся».
  events.sort((a, b) => a.time - b.time || a.delta - b.delta);
  return events;
}

/**
 * Прогоняет алгоритм развёртки и возвращает ПОЛНУЮ историю его шагов.
 * Это «ядро» приёма: чистая функция без React и сайд-эффектов —
 * её легко протестировать и переиспользовать.
 */
export function minMeetingRooms(intervals: Interval[]): IntervalStep[] {
  const steps: IntervalStep[] = [];
  const events = buildEvents(intervals);

  if (events.length === 0) {
    steps.push({
      eventIndex: -1,
      time: 0,
      delta: 0,
      active: 0,
      maxActive: 0,
      activeIds: [],
      intervalId: null,
      edge: null,
      description: "Встреч нет — комнат не нужно.",
      done: true,
    });
    return steps;
  }

  // Стартовый кадр: линия развёртки слева, никто ещё не активен.
  steps.push({
    eventIndex: -1,
    time: events[0].time,
    delta: 0,
    active: 0,
    maxActive: 0,
    activeIds: [],
    intervalId: null,
    edge: null,
    description:
      `Разбили ${intervals.length} встреч(и) на ${events.length} событий ` +
      "(начало +1, конец −1) и отсортировали по времени. " +
      "Ведём линию слева направо и считаем активные встречи.",
    done: false,
  });

  const active = new Set<number>();
  let maxActive = 0;

  events.forEach((event, i) => {
    const label = intervalLabel(event.intervalId);

    if (event.delta === 1) {
      active.add(event.intervalId);
    } else {
      active.delete(event.intervalId);
    }

    const activeNow = active.size;
    const isNewPeak = event.delta === 1 && activeNow > maxActive;
    maxActive = Math.max(maxActive, activeNow);

    let description: string;
    if (event.delta === 1) {
      description =
        `t = ${event.time}: началась встреча ${label}. Активных стало ${activeNow}.`;
      if (isNewPeak) {
        description += ` Это новый пик — нужно уже ${maxActive} комнат(ы).`;
      }
    } else {
      description =
        `t = ${event.time}: закончилась встреча ${label}. Освободилась комната, активных ${activeNow}.`;
    }

    const done = i === events.length - 1;
    if (done) {
      description += ` Все события разобраны — ответ: ${maxActive} комнат(ы).`;
    }

    steps.push({
      eventIndex: i,
      time: event.time,
      delta: event.delta,
      active: activeNow,
      maxActive,
      activeIds: [...active].sort((a, b) => a - b),
      intervalId: event.intervalId,
      edge: event.edge,
      description,
      done,
    });
  });

  return steps;
}
