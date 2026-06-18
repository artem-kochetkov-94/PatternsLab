// Приём «Два указателя» на задаче LeetCode 977 — «Squares of a Sorted Array».
//
// Дано: массив `nums`, отсортированный по возрастанию (может содержать
// отрицательные числа). Нужно вернуть массив квадратов его элементов,
// тоже отсортированный по возрастанию.
//
// Наивное решение — возвести всё в квадрат и заново отсортировать: O(n·log n).
// Приём «два указателя» решает задачу за один проход O(n): самый большой
// квадрат всегда даёт один из КРАЯ массива (либо самое отрицательное число
// слева, либо самое большое справа), поэтому результат удобно заполнять
// с конца, на каждом шаге сравнивая модули крайних элементов.

/**
 * Один «снимок» состояния алгоритма — всё, что нужно UI, чтобы нарисовать
 * текущий кадр визуализации. Алгоритм специально отделён от отрисовки:
 * трейсер возвращает массив шагов, а плеер просто листает их вперёд/назад.
 */
export interface TwoPointersStep {
  /** Индекс левого указателя. */
  left: number;
  /** Индекс правого указателя. */
  right: number;
  /** Позиция в результате, которую заполним следующей (идём с конца). */
  writeIndex: number;
  /** Снимок массива результата: `null` — ячейка ещё не заполнена. */
  result: (number | null)[];
  /** Какой указатель «победил» в сравнении на этом шаге. */
  picked: "left" | "right" | null;
  /** Человекочитаемое пояснение шага. */
  description: string;
  /** `true` на финальном шаге, когда указатели разошлись. */
  done: boolean;
}

/**
 * Прогоняет алгоритм и возвращает ПОЛНУЮ историю его шагов.
 * Это и есть «ядро» паттерна: чистая функция, без React и без сайд-эффектов —
 * её легко протестировать и переиспользовать.
 */
export function squaresOfSortedArray(nums: number[]): TwoPointersStep[] {
  const steps: TwoPointersStep[] = [];
  const n = nums.length;
  const result: (number | null)[] = new Array(n).fill(null);

  let left = 0;
  let right = n - 1;
  let writeIndex = n - 1;

  // Стартовый кадр: указатели на концах, результат пуст.
  steps.push({
    left,
    right,
    writeIndex,
    result: [...result],
    picked: null,
    done: n === 0,
    description:
      n === 0
        ? "Массив пуст — возвращать нечего."
        : `Ставим указатели на концы: L = ${left}, R = ${right}. ` +
          `Результат заполняем справа налево, начиная с позиции ${writeIndex}.`,
  });

  // Пока указатели не пересеклись, берём больший по модулю крайний элемент:
  // после возведения в квадрат он и есть наибольший из оставшихся.
  while (left <= right) {
    const leftVal = nums[left];
    const rightVal = nums[right];
    const leftSq = leftVal * leftVal;
    const rightSq = rightVal * rightVal;
    const placeAt = writeIndex;

    let picked: "left" | "right";
    let description: string;

    if (leftSq > rightSq) {
      // Слева модуль больше — его квадрат и будет максимальным.
      result[placeAt] = leftSq;
      picked = "left";
      description =
        `|${leftVal}|² = ${leftSq} больше, чем |${rightVal}|² = ${rightSq}: ` +
        `кладём ${leftSq} в позицию ${placeAt} и сдвигаем L вправо.`;
      left++;
    } else {
      // Справа модуль не меньше — берём его (заодно покрывает равенство).
      result[placeAt] = rightSq;
      picked = "right";
      description =
        `|${rightVal}|² = ${rightSq} не меньше, чем |${leftVal}|² = ${leftSq}: ` +
        `кладём ${rightSq} в позицию ${placeAt} и сдвигаем R влево.`;
      right--;
    }

    writeIndex--;
    const done = left > right;

    steps.push({
      left,
      right,
      writeIndex,
      result: [...result],
      picked,
      done,
      description: done
        ? description + " Указатели сошлись — массив собран."
        : description,
    });
  }

  return steps;
}
