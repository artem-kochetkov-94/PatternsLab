// Префиксные суммы по матрице (LeetCode 304) — тот же приём, что в solution.ts,
// но с записью КАЖДОГО шага для пошагового плеера. Демо состоит из двух фаз:
//   1) build — строим таблицу префиксных сумм P, клетка за клеткой;
//   2) query — отвечаем на запрос суммы прямоугольника по включениям-исключениям.
//
// Логика отделена от отрисовки: трейсер отдаёт массив шагов, а плеер их листает.

/** Координата клетки в какой-либо сетке (матрице или таблице P). */
export interface Cell {
  row: number;
  col: number;
}

/** Запрос: прямоугольник матрицы (0-индексация, обе границы включительно). */
export interface Rect {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

/** Один член формулы включений-исключений на фазе запроса. */
export interface QueryTerm {
  /** Знак: +1 добавляем, −1 вычитаем. */
  sign: 1 | -1;
  /** Клетка таблицы P, чьё значение берём. */
  prefixCell: Cell;
  /** Прямоугольник матрицы (0,0)…(row-1,col-1), который накрывает этот P. */
  covers: Rect | null;
  /** Значение P в этой клетке. */
  value: number;
}

/** Один «снимок» состояния алгоритма — кадр визуализации. */
export interface PrefixStep {
  /** Текущая фаза. */
  phase: "build" | "query";
  /** Снимок таблицы P: `null` — клетка ещё не вычислена. */
  prefix: (number | null)[][];

  // --- поля фазы build ---
  /** Клетка P, которую вычисляем на этом шаге. */
  buildCell: Cell | null;
  /** Клетки-слагаемые: сверху, слева, угол (diag) и исходная клетка матрицы. */
  contributors: {
    top: Cell;
    left: Cell;
    diag: Cell;
    source: Cell;
  } | null;

  // --- поля фазы query ---
  /** Запрашиваемый прямоугольник матрицы. */
  rect: Rect | null;
  /** Все члены формулы (для показа справа). */
  terms: QueryTerm[] | null;
  /** Индекс активного члена на этом шаге (−1 — итог). */
  activeTerm: number;
  /** Накопленная сумма после применения активного члена. */
  runningSum: number;

  /** Человекочитаемое пояснение шага. */
  description: string;
  /** `true` на финальном кадре. */
  done: boolean;
}

/** Глубокая копия таблицы P для снимка кадра. */
function snapshot(p: (number | null)[][]): (number | null)[][] {
  return p.map((row) => [...row]);
}

/**
 * Прогоняет приём и возвращает ПОЛНУЮ историю шагов: сначала построение
 * таблицы P, затем (если задан `rect`) разбор запроса суммы прямоугольника.
 */
export function tracePrefixSum(
  matrix: number[][],
  rect: Rect | null,
): PrefixStep[] {
  const steps: PrefixStep[] = [];
  const m = matrix.length;
  const n = m > 0 ? matrix[0].length : 0;

  // P размера (m+1)×(n+1): нулевые строка и столбец уже «вычислены» (= 0),
  // остальное — null, пока не дойдём.
  const P: (number | null)[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)),
  );

  const baseQuery = {
    rect: null,
    terms: null,
    activeTerm: -1,
    runningSum: 0,
  } as const;

  // Стартовый кадр фазы build.
  steps.push({
    phase: "build",
    prefix: snapshot(P),
    buildCell: null,
    contributors: null,
    ...baseQuery,
    description:
      `Строим таблицу префиксов P размера ${m + 1}×${n + 1}. ` +
      "Нулевые строка и столбец — это «пустые» суммы (0), они убирают проверки границ. " +
      "Каждую внутреннюю клетку считаем по формуле: число + сверху + слева − угол.",
    done: false,
  });

  // --- Фаза build ---
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const top = P[i - 1][j] as number;
      const left = P[i][j - 1] as number;
      const diag = P[i - 1][j - 1] as number;
      const src = matrix[i - 1][j - 1];
      P[i][j] = src + top + left - diag;

      steps.push({
        phase: "build",
        prefix: snapshot(P),
        buildCell: { row: i, col: j },
        contributors: {
          top: { row: i - 1, col: j },
          left: { row: i, col: j - 1 },
          diag: { row: i - 1, col: j - 1 },
          source: { row: i - 1, col: j - 1 },
        },
        ...baseQuery,
        description:
          `P[${i}][${j}] = ${src} (matrix[${i - 1}][${j - 1}]) + ${top} (сверху) + ` +
          `${left} (слева) − ${diag} (угол) = ${P[i][j]}.`,
        done: false,
      });
    }
  }

  // Если запрос не задан — на построении и заканчиваем.
  if (!rect) {
    steps[steps.length - 1] = {
      ...steps[steps.length - 1],
      done: true,
      description:
        steps[steps.length - 1].description +
        " Таблица готова — теперь любой запрос суммы считается за O(1).",
    };
    return steps;
  }

  // --- Фаза query: сумма прямоугольника по включениям-исключениям ---
  const { r1, c1, r2, c2 } = rect;
  const terms: QueryTerm[] = [
    {
      sign: 1,
      prefixCell: { row: r2 + 1, col: c2 + 1 },
      covers: { r1: 0, c1: 0, r2, c2 },
      value: P[r2 + 1][c2 + 1] as number,
    },
    {
      sign: -1,
      prefixCell: { row: r1, col: c2 + 1 },
      covers: r1 > 0 ? { r1: 0, c1: 0, r2: r1 - 1, c2 } : null,
      value: P[r1][c2 + 1] as number,
    },
    {
      sign: -1,
      prefixCell: { row: r2 + 1, col: c1 },
      covers: c1 > 0 ? { r1: 0, c1: 0, r2, c2: c1 - 1 } : null,
      value: P[r2 + 1][c1] as number,
    },
    {
      sign: 1,
      prefixCell: { row: r1, col: c1 },
      covers: r1 > 0 && c1 > 0 ? { r1: 0, c1: 0, r2: r1 - 1, c2: c1 - 1 } : null,
      value: P[r1][c1] as number,
    },
  ];

  const termText = [
    `+P[${r2 + 1}][${c2 + 1}] = ${terms[0].value}: берём весь блок от угла до (${r2},${c2}).`,
    `−P[${r1}][${c2 + 1}] = ${terms[1].value}: вычитаем полосу сверху над прямоугольником.`,
    `−P[${r2 + 1}][${c1}] = ${terms[2].value}: вычитаем полосу слева от прямоугольника.`,
    `+P[${r1}][${c1}] = ${terms[3].value}: верхне-левый угол вычли дважды — возвращаем его.`,
  ];

  // Вводный кадр запроса.
  steps.push({
    phase: "query",
    prefix: snapshot(P),
    buildCell: null,
    contributors: null,
    rect,
    terms,
    activeTerm: -1,
    runningSum: 0,
    description:
      `Запрос: сумма прямоугольника (${r1},${c1})…(${r2},${c2}). ` +
      "Считаем её четырьмя обращениями к P по формуле включений-исключений.",
    done: false,
  });

  let running = 0;
  terms.forEach((term, k) => {
    running += term.sign * term.value;
    const isLast = k === terms.length - 1;
    steps.push({
      phase: "query",
      prefix: snapshot(P),
      buildCell: null,
      contributors: null,
      rect,
      terms,
      activeTerm: k,
      runningSum: running,
      description: isLast
        ? `${termText[k]} Итог: сумма прямоугольника = ${running}.`
        : `${termText[k]} Накоплено: ${running}.`,
      done: isLast,
    });
  });

  return steps;
}
