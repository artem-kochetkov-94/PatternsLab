// Бинарный поиск (LeetCode 704) — чистый, «боевой» вариант.
//
// Дано: массив, отсортированный по возрастанию, и число target. Нужно вернуть
// индекс target в массиве или −1, если его нет.
//
// Идея: на каждом шаге смотрим середину текущего диапазона. Так как массив
// отсортирован, сравнение с серединой сразу отбрасывает ПОЛОВИНУ кандидатов:
// если середина меньше target — target правее, иначе левее. Диапазон
// сокращается вдвое за шаг, поэтому всего O(log n) сравнений вместо O(n).
//
// Рядом binarySearch.ts — тот же алгоритм, но с записью каждого шага для плеера.

/** Точный поиск: индекс target или −1. */
export function binarySearch(nums: number[], target: number): number {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    // (low + high) >> 1 — то же, что Math.floor((low+high)/2), но без переполнения
    // знаковой границы и быстрее. Берём середину текущего диапазона.
    const mid = (low + high) >> 1;

    if (nums[mid] === target) return mid; // попали
    if (nums[mid] < target)
      low = mid + 1; // target правее — отбрасываем левую половину
    else high = mid - 1; // target левее — отбрасываем правую половину
  }

  return -1; // диапазон схлопнулся — числа нет
}

/**
 * Левая граница (lower bound): индекс ПЕРВОГО элемента ≥ target.
 * Возвращает значение в диапазоне [0, n] — это самый полезный на интервью
 * вариант: через него делаются «вставить позицию», count, поиск диапазона.
 *
 * Тонкость в инвариантах: ищем в полуинтервале [low, high), и при попадании
 * НЕ выходим сразу, а продолжаем сжимать диапазон влево.
 */
export function lowerBound(nums: number[], target: number): number {
  let low = 0;
  let high = nums.length; // полуинтервал [low, high)

  while (low < high) {
    const mid = (low + high) >> 1;
    if (nums[mid] < target)
      low = mid + 1; // mid точно меньше — ответ строго правее
    else high = mid; // mid подходит как кандидат — оставляем его в диапазоне
  }

  return low;
}

/**
 * Правая граница (upper bound): индекс ПЕРВОГО элемента строго &gt; target.
 * Отличается от lowerBound ровно одним символом — нестрогим сравнением: так
 * элементы, равные target, тоже уходят влево от границы. Поэтому количество
 * вхождений target в массив = upperBound − lowerBound.
 */
export function upperBound(nums: number[], target: number): number {
  let low = 0;
  let high = nums.length;

  while (low < high) {
    const mid = (low + high) >> 1;
    if (nums[mid] <= target)
      low = mid + 1; // mid ≤ target — граница строго правее
    else high = mid; // mid строго больше — кандидат, оставляем в диапазоне
  }

  return low;
}
