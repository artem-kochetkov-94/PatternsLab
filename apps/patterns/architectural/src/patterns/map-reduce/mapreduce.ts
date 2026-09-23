/**
 * MapReduce — модель обработки больших объёмов данных, разбитая на три
 * фазы, каждая из которых легко параллелится по множеству машин:
 *  - Map — независимо обрабатываем каждый маленький кусок входных данных,
 *    превращая его в пары (ключ, значение);
 *  - Shuffle — группируем пары по ключу, собирая одинаковые ключи вместе
 *    независимо от того, на какой машине они были посчитаны;
 *  - Reduce — сворачиваем каждую группу в одно итоговое значение.
 * Классический пример — word count: посчитать, сколько раз встречается
 * каждое слово в тексте.
 */

export const INPUT_TEXT = "Welcome to Hadoop\nClass Hadoop is\ngood Hadoop is\nbad";

export const CUT_LINES = ["Welcome to Hadoop", "Class Hadoop is", "good Hadoop is", "bad"];

export interface WordPair {
  word: string;
  count: number;
}

/** Map: каждая строка — независимо превращается в пары (слово, 1). */
export const MAP_OUTPUT: WordPair[][] = [
  [
    { word: "Welcome", count: 1 },
    { word: "to", count: 1 },
    { word: "Hadoop", count: 1 },
  ],
  [
    { word: "Class", count: 1 },
    { word: "Hadoop", count: 1 },
    { word: "is", count: 1 },
  ],
  [
    { word: "good", count: 1 },
    { word: "Hadoop", count: 1 },
    { word: "is", count: 1 },
  ],
  [{ word: "bad", count: 1 }],
];

/** Shuffle: те же пары, но сгруппированные по слову — независимо от того, из какой строки они пришли. */
export const SHUFFLE_GROUPS: { word: string; counts: number[] }[] = [
  { word: "bad", counts: [1] },
  { word: "Class", counts: [1] },
  { word: "good", counts: [1] },
  { word: "Hadoop", counts: [1, 1, 1] },
  { word: "is", counts: [1, 1] },
  { word: "to", counts: [1] },
  { word: "Welcome", counts: [1] },
];

/** Reduce: каждая группа сворачивается суммой в одно значение. */
export const REDUCE_OUTPUT: WordPair[] = SHUFFLE_GROUPS.map((g) => ({
  word: g.word,
  count: g.counts.reduce((a, b) => a + b, 0),
}));

export type MapReducePhase = "input" | "cut" | "map" | "shuffle" | "reduce";

export const PHASES: { id: MapReducePhase; label: string; description: string }[] = [
  {
    id: "input",
    label: "Исходный текст",
    description: "Один большой текст, который нужно посчитать по словам.",
  },
  {
    id: "cut",
    label: "Cut",
    description: "Текст режется на независимые куски (строки) — каждый можно обработать на своей машине.",
  },
  {
    id: "map",
    label: "Map",
    description: "Каждая строка независимо превращается в пары (слово, 1) — Map-задачи не общаются друг с другом.",
  },
  {
    id: "shuffle",
    label: "Shuffle",
    description: "Все пары перемешиваются и группируются по ключу (слову), собирая вместе результаты с разных машин.",
  },
  {
    id: "reduce",
    label: "Reduce",
    description: "Каждая группа сворачивается в одно значение — здесь просто суммой. Итог: точное количество каждого слова.",
  },
];
