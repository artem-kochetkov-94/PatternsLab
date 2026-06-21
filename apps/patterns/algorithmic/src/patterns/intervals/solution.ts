// Чистый алгоритм без обвязки для пошаговой визуализации — ровно то, что
// писали бы на собеседовании или в проде. Рядом лежит intervals.ts: это
// тот же алгоритм, но дополнительно складывающий каждый шаг в массив, чтобы
// плеер мог его прокрутить. Здесь — только суть.

export type Interval = [start: number, end: number];

/**
 * Meeting Rooms II (LeetCode 253) — метод точек (он же развёртка / sweep line).
 * Минимум переговорок = максимальное число встреч, идущих одновременно.
 *
 * Каждую встречу разбиваем на две точки на оси времени: +1 в начале и −1
 * в конце. Сортируем все точки по времени и идём слева направо, держа
 * текущий счётчик занятых комнат; его максимум за проход и есть ответ.
 *
 * Время O(n·log n) на сортировку, память O(n).
 */
export function minMeetingRooms(intervals: Interval[]): number {
  // Точка = [время, дельта]: +1 — встреча началась, −1 — закончилась.
  const points: [time: number, delta: number][] = [];
  for (const [start, end] of intervals) {
    points.push([start, 1]);
    points.push([end, -1]);
  }

  // Сортируем по времени; при равном времени −1 (конец) идёт раньше +1
  // (начала), иначе встреча [0,10] ложно «пересечётся» с [10,20].
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  let currentRooms = 0;
  let maxRooms = 0;

  for (const [, delta] of points) {
    currentRooms += delta;
    maxRooms = Math.max(maxRooms, currentRooms);
  }

  return maxRooms;
}

/**
 * Merge Intervals (LeetCode 56) — соседний приём «слияния».
 * Сортируем по началу и склеиваем каждый следующий отрезок с предыдущим,
 * пока они перекрываются. Возвращает непрерывные «острова».
 *
 * Время O(n·log n), память O(n).
 */
export function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];

  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const last = merged[merged.length - 1];

    if (start <= last[1]) {
      // Перекрытие — расширяем конец последнего «острова».
      last[1] = Math.max(last[1], end);
    } else {
      // Разрыв — начинаем новый остров.
      merged.push([start, end]);
    }
  }

  return merged;
}
