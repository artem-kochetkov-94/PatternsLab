// Daily Temperatures (LeetCode 739) — тот же монотонный стек, что в
// dailyTemperatures.ts, но с записью КАЖДОГО шага для пошагового плеера.
// Логика отделена от отрисовки: трейсер возвращает массив шагов, плеер их листает.

/** Что произошло на шаге — задаёт подсветку и подпись. */
export type TempAction =
  | "init" // старт
  | "resolve" // текущий день закрыл более холодный с вершины стека
  | "push" // текущий день встал на стек ждать потепления
  | "final"; // все дни обработаны

/** Один «снимок» состояния — кадр визуализации. */
export interface TempStep {
  /** Сканируемый индекс дня (или `null` на init/финале). */
  pos: number | null;
  /** Индексы дней на монотонном стеке (вершина — последний элемент). */
  stack: number[];
  /** Ответы, посчитанные к этому шагу (`null` — ещё не известен). */
  answer: (number | null)[];
  /** Индекс дня, который ИМЕННО сейчас закрыли (для вспышки), иначе `null`. */
  resolved: number | null;
  /** Тип шага. */
  action: TempAction;
  /** Человекочитаемое пояснение шага. */
  description: string;
  /** `true` на финальном кадре. */
  done: boolean;
}

/** Прогоняет алгоритм и возвращает ПОЛНУЮ историю шагов. */
export function dailyTemperaturesTrace(temps: number[]): TempStep[] {
  const steps: TempStep[] = [];
  const n = temps.length;
  const answer: (number | null)[] = new Array(n).fill(null);
  const stack: number[] = [];

  steps.push({
    pos: null,
    stack: [],
    answer: [...answer],
    resolved: null,
    action: "init",
    description:
      n === 0
        ? "Массив пуст — считать нечего."
        : "Идём по дням слева направо. На стеке — индексы дней, что ещё ждут потепления; их температуры убывают от дна к вершине.",
    done: n === 0,
  });

  if (n === 0) return steps;

  for (let i = 0; i < n; i++) {
    // Снимаем все более холодные дни — для них потепление наступило сегодня.
    while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
      const day = stack.pop()!;
      answer[day] = i - day;
      steps.push({
        pos: i,
        stack: [...stack],
        answer: [...answer],
        resolved: day,
        action: "resolve",
        description: `День ${i} (${temps[i]}°) теплее дня ${day} (${temps[day]}°) на вершине. Для дня ${day} потепление через ${i - day} дн. — снимаем его со стека.`,
        done: false,
      });
    }

    stack.push(i);
    const below = stack.length > 1 ? stack[stack.length - 2] : null;
    steps.push({
      pos: i,
      stack: [...stack],
      answer: [...answer],
      resolved: null,
      action: "push",
      description:
        below === null
          ? `Стек пуст — кладём день ${i} (${temps[i]}°), он ждёт своего потепления.`
          : `День ${i} (${temps[i]}°) не теплее дня ${below} (${temps[below]}°) под ним — кладём ${i} на стек ждать потепления.`,
      done: false,
    });
  }

  // Финал: оставшиеся на стеке дни потепления не дождались — у них 0.
  for (let k = 0; k < n; k++) if (answer[k] === null) answer[k] = 0;
  steps.push({
    pos: null,
    stack: [...stack],
    answer: [...answer],
    resolved: null,
    action: "final",
    description:
      stack.length > 0
        ? `Конец. Дни ${stack.join(", ")} остались на стеке — потепления впереди нет, у них 0.`
        : "Конец. Каждый день дождался потепления.",
    done: true,
  });

  return steps;
}
