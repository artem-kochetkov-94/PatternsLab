// Минимальное удаление скобок (LeetCode 1249) — тот же приём, что в solution.ts,
// но с записью КАЖДОГО шага для пошагового плеера. Логика отделена от отрисовки:
// трейсер возвращает массив шагов, плеер их листает.
//
// Стек хранит индексы ещё не закрытых «(». Каждый шаг — это «снимок» состояния:
// что сейчас под курсором, что лежит на стеке и какие индексы уже под удаление.

/** Что произошло на шаге — задаёт подсветку и подпись. */
export type StackAction =
  | "init" // старт, ещё ничего не сделали
  | "push" // встретили «(» — положили её индекс на стек
  | "pop" // встретили «)» — нашли пару, сняли «(» с вершины
  | "mark" // встретили лишнюю «)» — пометили на удаление
  | "skip" // буква — скобки не трогаем
  | "sweep" // конец строки — открытые без пары идут на удаление
  | "final"; // собрали результат

/** Один «снимок» состояния разбора — кадр визуализации. */
export interface StackStep {
  /** Сканируемый индекс строки (или `null` на init/sweep/финале). */
  pos: number | null;
  /** Индексы «(» на стеке В ЭТОТ момент (вершина — последний элемент). */
  stack: number[];
  /** Индексы, помеченные на удаление к этому шагу. */
  removed: number[];
  /** Тип шага. */
  action: StackAction;
  /** Человекочитаемое пояснение шага. */
  description: string;
  /** Итоговая строка (только на финальном кадре, иначе `null`). */
  result: string | null;
  /** `true` на финальном кадре. */
  done: boolean;
}

/** Прогоняет алгоритм и возвращает ПОЛНУЮ историю шагов. */
export function minRemoveTrace(s: string): StackStep[] {
  const steps: StackStep[] = [];
  const open: number[] = [];
  const remove = new Set<number>();

  steps.push({
    pos: null,
    stack: [],
    removed: [],
    action: "init",
    description:
      s.length === 0
        ? "Строка пустая — удалять нечего."
        : "Идём по строке слева направо. Стек хранит индексы открытых «(», " +
          "ждущих свою «)».",
    result: s.length === 0 ? "" : null,
    done: s.length === 0,
  });

  if (s.length === 0) return steps;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (ch === "(") {
      open.push(i);
      steps.push({
        pos: i,
        stack: [...open],
        removed: [...remove],
        action: "push",
        description: `[${i}] «(» — кладём индекс ${i} на стек, ждём для неё «)».`,
        result: null,
        done: false,
      });
    } else if (ch === ")") {
      if (open.length > 0) {
        const matched = open.pop()!;
        steps.push({
          pos: i,
          stack: [...open],
          removed: [...remove],
          action: "pop",
          description: `[${i}] «)» — на стеке есть открытая (индекс ${matched}). Пара нашлась, снимаем её с вершины.`,
          result: null,
          done: false,
        });
      } else {
        remove.add(i);
        steps.push({
          pos: i,
          stack: [...open],
          removed: [...remove],
          action: "mark",
          description: `[${i}] «)» — стек пуст, закрывать нечего. Эта «)» лишняя — помечаем индекс ${i} на удаление.`,
          result: null,
          done: false,
        });
      }
    } else {
      steps.push({
        pos: i,
        stack: [...open],
        removed: [...remove],
        action: "skip",
        description: `[${i}] «${ch}» — буква, на баланс скобок не влияет. Идём дальше.`,
        result: null,
        done: false,
      });
    }
  }

  // Подметаем стек: всё, что осталось, — открытые «(» без пары.
  if (open.length > 0) {
    for (const i of open) remove.add(i);
    steps.push({
      pos: null,
      stack: [],
      removed: [...remove],
      action: "sweep",
      description: `Конец строки, но на стеке остались открытые без пары: ${open.join(", ")}. Все они лишние — на удаление.`,
      result: null,
      done: false,
    });
  }

  let result = "";
  for (let i = 0; i < s.length; i++) if (!remove.has(i)) result += s[i];

  steps.push({
    pos: null,
    stack: [],
    removed: [...remove],
    action: "final",
    description:
      remove.size === 0
        ? `Удалять нечего — строка уже валидна. Результат: «${result}».`
        : `Собираем строку, пропуская помеченные индексы (${remove.size} шт.). Результат: «${result}».`,
    result,
    done: true,
  });

  return steps;
}
