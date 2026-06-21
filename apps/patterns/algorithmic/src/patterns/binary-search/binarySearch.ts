// Бинарный поиск (LeetCode 704) — тот же приём, что в solution.ts, но с записью
// КАЖДОГО шага для пошагового плеера. Поддерживает три режима:
//   exact — точный поиск индекса target (диапазон [low, high], включительно);
//   lower — левая граница: первый индекс с nums[i] ≥ target (полуинтервал [low, high));
//   upper — правая граница: первый индекс с nums[i] > target (тот же полуинтервал).
//
// Логика отделена от отрисовки: трейсер возвращает массив шагов, плеер их листает.

export type SearchMode = "exact" | "lower" | "upper";

/** Один «снимок» состояния поиска — кадр визуализации. */
export interface BinarySearchStep {
  /** Режим, в котором снят кадр (влияет на трактовку границ). */
  mode: SearchMode;
  /** Левая граница текущего диапазона. */
  low: number;
  /** Правая граница: включительно для exact, исключительно для lower/upper. */
  high: number;
  /** Проверяемая середина (или `null` на старте/в финале). */
  mid: number | null;
  /** Подсветка середины: точное совпадение или обычный шаг сужения. */
  highlight: "eq" | "scan" | null;
  /** Индекс точного совпадения (только режим exact). */
  found: number | null;
  /** Найденная граница 0…n (только режимы lower/upper, на финале). */
  answer: number | null;
  /** Человекочитаемое пояснение шага. */
  description: string;
  /** `true` на финальном кадре. */
  done: boolean;
}

/** Прогоняет выбранный режим и возвращает ПОЛНУЮ историю шагов. */
export function binarySearchTrace(
  nums: number[],
  target: number,
  mode: SearchMode,
): BinarySearchStep[] {
  return mode === "exact"
    ? exactTrace(nums, target)
    : boundaryTrace(nums, target, mode);
}

/** Точный поиск: индекс target или −1. Диапазон [low, high] включительно. */
function exactTrace(nums: number[], target: number): BinarySearchStep[] {
  const steps: BinarySearchStep[] = [];
  let low = 0;
  let high = nums.length - 1;

  steps.push({
    mode: "exact",
    low,
    high,
    mid: null,
    highlight: null,
    found: null,
    answer: null,
    description:
      nums.length === 0
        ? "Массив пуст — искать негде."
        : `Ищем ${target}. Ставим границы: low = 0, high = ${high}. ` +
          "Каждый шаг смотрим середину диапазона.",
    done: nums.length === 0,
  });

  while (low <= high) {
    const mid = (low + high) >> 1;
    const value = nums[mid];

    if (value === target) {
      steps.push({
        mode: "exact",
        low,
        high,
        mid,
        highlight: "eq",
        found: mid,
        answer: null,
        description: `mid = ${mid}, nums[${mid}] = ${value} — это target. Нашли на индексе ${mid}.`,
        done: true,
      });
      return steps;
    }

    const goRight = value < target;
    steps.push({
      mode: "exact",
      low,
      high,
      mid,
      highlight: "scan",
      found: null,
      answer: null,
      description: goRight
        ? `mid = ${mid}, nums[${mid}] = ${value} < ${target}: target правее. low = ${mid + 1}, левая половина отброшена.`
        : `mid = ${mid}, nums[${mid}] = ${value} > ${target}: target левее. high = ${mid - 1}, правая половина отброшена.`,
      done: false,
    });
    if (goRight) low = mid + 1;
    else high = mid - 1;
  }

  steps.push({
    mode: "exact",
    low,
    high,
    mid: null,
    highlight: null,
    found: null,
    answer: null,
    description: `low (${low}) обогнал high (${high}) — диапазон пуст. ${target} в массиве нет.`,
    done: true,
  });

  return steps;
}

/**
 * Граница (lower/upper) на полуинтервале [low, high). Результат — индекс в
 * диапазоне 0…n. Отличие режимов ровно в одном: строгое (<) или нестрогое (≤)
 * сравнение с target определяет, уходят ли равные target элементы влево.
 */
function boundaryTrace(
  nums: number[],
  target: number,
  mode: "lower" | "upper",
): BinarySearchStep[] {
  const steps: BinarySearchStep[] = [];
  const n = nums.length;
  let low = 0;
  let high = n; // полуинтервал [low, high)

  const goalSign = mode === "lower" ? "≥" : ">";

  steps.push({
    mode,
    low,
    high,
    mid: null,
    highlight: null,
    found: null,
    answer: null,
    description:
      `Ищем границу: первый индекс с nums[i] ${goalSign} ${target}. ` +
      `Диапазон полуоткрытый [0, ${n}); ответ может оказаться и за концом массива.`,
    done: n === 0 ? true : false,
  });

  if (n === 0) {
    steps[0] = { ...steps[0], answer: 0 };
    return steps;
  }

  while (low < high) {
    const mid = (low + high) >> 1;
    const value = nums[mid];
    // lower: уходим вправо, пока nums[mid] < target.
    // upper: уходим вправо, пока nums[mid] ≤ target (равные тоже отбрасываем).
    const goRight = mode === "lower" ? value < target : value <= target;

    steps.push({
      mode,
      low,
      high,
      mid,
      highlight: "scan",
      found: null,
      answer: null,
      description: goRight
        ? `mid = ${mid}, nums[${mid}] = ${value} ${mode === "lower" ? "<" : "≤"} ${target}: граница правее. low = ${mid + 1}.`
        : `mid = ${mid}, nums[${mid}] = ${value} ${mode === "lower" ? "≥" : ">"} ${target}: mid — кандидат на границу. high = ${mid}.`,
      done: false,
    });
    if (goRight) low = mid + 1;
    else high = mid;
  }

  const atEnd = low === n;
  steps.push({
    mode,
    low,
    high: low,
    mid: null,
    highlight: null,
    found: null,
    answer: low,
    description: atEnd
      ? `Диапазон схлопнулся: граница = ${low} (за концом массива). Все элементы не дотягивают до условия «${goalSign} ${target}».`
      : `Диапазон схлопнулся: граница = ${low}. nums[${low}] = ${nums[low]} — первый элемент с условием «${goalSign} ${target}».`,
    done: true,
  });

  return steps;
}
