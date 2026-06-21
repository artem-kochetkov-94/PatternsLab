// Сортировка слиянием — тот же приём, что в solution.ts, но с записью КАЖДОГО
// шага для пошагового плеера. Логика отделена от отрисовки: трейсер возвращает
// массив «снимков» (Step[]), а плеер их листает.
//
// Что показываем:
//   • «split»   — текущий отрезок [lo, hi) делится пополам на [lo, mid) и [mid, hi);
//   • «compare» — сравниваем «головы» двух отсортированных половин;
//   • «copy»    — меньший элемент уезжает в результат слияния;
//   • «merged»  — половины слиты, отрезок массива стал отсортированным.
//
// Чтобы основной массив во время слияния не «дёргался», результат собираем в
// отдельном буфере и записываем его в массив целиком на шаге «merged».

export type MergePhase = "start" | "split" | "compare" | "copy" | "merged" | "done";

/** Один «снимок» состояния сортировки — кадр визуализации. */
export interface MergeSortStep {
  /** Состояние всего массива на этот момент. */
  array: number[];
  /** Границы текущего отрезка: полуинтервал [lo, hi). */
  lo: number;
  mid: number;
  hi: number;
  /** Фаза шага. */
  phase: MergePhase;
  /** Глубина рекурсии (0 — весь массив) — для отступа/оттенка. */
  depth: number;
  /** Левая половина слияния (значения), null вне слияния. */
  left: number[] | null;
  /** Правая половина слияния (значения), null вне слияния. */
  right: number[] | null;
  /** Указатель в левой половине. */
  i: number | null;
  /** Указатель в правой половине. */
  j: number | null;
  /** Уже слитые значения (длина = сколько записано в результат). */
  result: number[] | null;
  /** Какая сторона победила в сравнении/копировании: для подсветки. */
  picked: "left" | "right" | null;
  /** Человекочитаемое пояснение шага. */
  description: string;
  /** `true` на финальном кадре. */
  done: boolean;
}

/** Прогоняет сортировку слиянием и возвращает ПОЛНУЮ историю шагов. */
export function mergeSortTrace(input: number[]): MergeSortStep[] {
  const steps: MergeSortStep[] = [];
  const a = [...input]; // рабочая копия, мутируется по ходу
  const n = a.length;

  // Заготовка кадра: общие поля + перекрытие конкретными значениями.
  const frame = (over: Partial<MergeSortStep>): MergeSortStep => ({
    array: [...a],
    lo: 0,
    mid: 0,
    hi: n,
    phase: "split",
    depth: 0,
    left: null,
    right: null,
    i: null,
    j: null,
    result: null,
    picked: null,
    description: "",
    done: false,
    ...over,
  });

  steps.push(
    frame({
      phase: "start",
      description:
        n <= 1
          ? "Массив из 0–1 элемента уже отсортирован — делать нечего."
          : `Сортируем ${n} элементов слиянием. Стратегия «разделяй и властвуй»: рекурсивно делим пополам, затем сливаем отсортированные половины.`,
      done: n <= 1,
    }),
  );

  function sort(lo: number, hi: number, depth: number) {
    if (hi - lo <= 1) return; // отрезок из 0–1 элемента уже отсортирован

    const mid = (lo + hi) >> 1;
    steps.push(
      frame({
        phase: "split",
        lo,
        mid,
        hi,
        depth,
        description: `Делим отрезок [${lo}, ${hi}) пополам: [${lo}, ${mid}) и [${mid}, ${hi}).`,
      }),
    );

    sort(lo, mid, depth + 1); // сортируем левую половину
    sort(mid, hi, depth + 1); // сортируем правую половину
    merge(lo, mid, hi, depth); // сливаем две отсортированные половины
  }

  function merge(lo: number, mid: number, hi: number, depth: number) {
    const left = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    const result: number[] = [];
    let i = 0;
    let j = 0;

    const base = () => ({ lo, mid, hi, depth, left: [...left], right: [...right] });

    while (i < left.length && j < right.length) {
      steps.push(
        frame({
          ...base(),
          phase: "compare",
          i,
          j,
          result: [...result],
          description: `Сравниваем головы половин: ${left[i]} и ${right[j]}. Меньший уйдёт в результат.`,
        }),
      );

      const takeLeft = left[i] <= right[j];
      const value = takeLeft ? left[i] : right[j];
      result.push(value);
      steps.push(
        frame({
          ...base(),
          phase: "copy",
          i,
          j,
          result: [...result],
          picked: takeLeft ? "left" : "right",
          description: `${value} ${takeLeft ? "из левой" : "из правой"} половины меньше — дописываем его в результат.`,
        }),
      );
      if (takeLeft) i++;
      else j++;
    }

    // Хвост одной из половин (вторая кончилась) — он уже отсортирован.
    while (i < left.length) {
      result.push(left[i]);
      steps.push(
        frame({
          ...base(),
          phase: "copy",
          i,
          j,
          result: [...result],
          picked: "left",
          description: `Правая половина кончилась — переносим остаток левой: ${left[i]}.`,
        }),
      );
      i++;
    }
    while (j < right.length) {
      result.push(right[j]);
      steps.push(
        frame({
          ...base(),
          phase: "copy",
          i,
          j,
          result: [...result],
          picked: "right",
          description: `Левая половина кончилась — переносим остаток правой: ${right[j]}.`,
        }),
      );
      j++;
    }

    // Записываем собранный результат обратно в массив — отрезок отсортирован.
    for (let t = 0; t < result.length; t++) a[lo + t] = result[t];
    steps.push(
      frame({
        lo,
        mid,
        hi,
        depth,
        phase: "merged",
        description: `Слили половины: отрезок [${lo}, ${hi}) отсортирован → [${result.join(", ")}].`,
      }),
    );
  }

  sort(0, n, 0);

  steps.push(
    frame({
      phase: "done",
      description: `Готово: массив отсортирован за O(n·log n) — [${a.join(", ")}].`,
      done: true,
    }),
  );

  return steps;
}
