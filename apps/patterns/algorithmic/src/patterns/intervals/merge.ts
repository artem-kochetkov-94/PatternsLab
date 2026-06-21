// Merge Intervals (LeetCode 56) — приём «слияния».
//
// Дано: список отрезков. Нужно склеить все перекрывающиеся в непрерывные
// «острова» и вернуть их. Например, [1,3],[2,6],[8,10],[15,18] → [1,6],[8,10],[15,18].
//
// Идея: сортируем отрезки по НАЧАЛУ и идём слева направо, держа «последний
// собранный остров». Если очередной отрезок начинается не позже конца острова
// (start ≤ end) — они пересекаются (или касаются), и мы просто РАСШИРЯЕМ конец
// острова. Иначе между ними разрыв — начинаем новый остров.
//
// Отличие от Meeting Rooms: здесь касание (end === start) СЧИТАЕТСЯ слиянием
// (отрезки замкнутые), поэтому условие нестрогое: start ≤ end.
//
// Чистый вариант — в solution.ts (`mergeIntervals`). Здесь алгоритм
// дополнительно складывает каждый шаг в массив для пошагового плеера.

import type { Interval } from "./intervals";
import { intervalLabel } from "./intervals";

/** Один собранный «остров»: его границы и id впитанных в него встреч. */
export interface MergedIsland {
  start: number;
  end: number;
  /** id исходных отрезков, слитых в этот остров (для подсветки). */
  sourceIds: number[];
}

/** Один «снимок» состояния слияния — всё, что нужно UI для отрисовки кадра. */
export interface MergeStep {
  /** Индекс текущего отрезка в порядке сортировки (−1 — стартовый кадр). */
  cursor: number;
  /** id отрезка, который рассматриваем (для акцента). */
  intervalId: number | null;
  /** Снимок уже собранных островов. */
  merged: MergedIsland[];
  /** Что сделали на шаге: расширили остров или начали новый. */
  action: "init" | "extend" | "push";
  /** Человекочитаемое пояснение шага. */
  description: string;
  /** `true` на финальном кадре. */
  done: boolean;
}

/**
 * Прогоняет слияние и возвращает ПОЛНУЮ историю шагов.
 * Чистая функция без React: трейсер для плеера.
 */
export function mergeIntervalsTrace(intervals: Interval[]): MergeStep[] {
  const steps: MergeStep[] = [];

  if (intervals.length === 0) {
    steps.push({
      cursor: -1,
      intervalId: null,
      merged: [],
      action: "init",
      description: "Отрезков нет — сливать нечего.",
      done: true,
    });
    return steps;
  }

  // Сортируем по началу — это вся подготовка, которая нужна приёму.
  const sorted = [...intervals].sort((a, b) => a.start - b.start);

  steps.push({
    cursor: -1,
    intervalId: null,
    merged: [],
    action: "init",
    description:
      "Отсортировали отрезки по началу. Идём слева направо и склеиваем " +
      "каждый следующий с последним островом, пока они перекрываются.",
    done: false,
  });

  const merged: MergedIsland[] = [];

  sorted.forEach((cur, i) => {
    const label = intervalLabel(cur.id);
    const last = merged[merged.length - 1];
    const done = i === sorted.length - 1;

    let action: "extend" | "push";
    let description: string;

    if (last && cur.start <= last.end) {
      // Перекрытие или касание — расширяем конец последнего острова.
      const grew = cur.end > last.end;
      last.end = Math.max(last.end, cur.end);
      last.sourceIds.push(cur.id);
      action = "extend";
      description = grew
        ? `${label} [${cur.start}, ${cur.end}] перекрывает остров — расширяем его конец до ${last.end}.`
        : `${label} [${cur.start}, ${cur.end}] целиком внутри острова — он не меняется.`;
    } else {
      // Разрыв — начинаем новый остров.
      merged.push({ start: cur.start, end: cur.end, sourceIds: [cur.id] });
      action = "push";
      description = last
        ? `${label} [${cur.start}, ${cur.end}] начинается после конца острова (${last.end}) — это новый остров.`
        : `${label} [${cur.start}, ${cur.end}] — первый остров.`;
    }

    if (done) {
      description += ` Готово: ${merged.length} остров(а/ов).`;
    }

    steps.push({
      cursor: i,
      intervalId: cur.id,
      // Глубокая копия островов, иначе все кадры будут ссылаться на один объект.
      merged: merged.map((isl) => ({ ...isl, sourceIds: [...isl.sourceIds] })),
      action,
      description,
      done,
    });
  });

  return steps;
}

/** Порядок отрезков после сортировки по началу (для отрисовки верхней ленты). */
export function sortByStart(intervals: Interval[]): Interval[] {
  return [...intervals].sort((a, b) => a.start - b.start);
}
