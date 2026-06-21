// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
import solutionSource from "./solution.ts?raw";
import stackSource from "./stack.ts?raw";
import dailyTempSource from "./dailyTemperatures.ts?raw";
import dailyTempTraceSource from "./dailyTemperaturesTrace.ts?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config. В демо — две задачи на стек
 * (переключатель): парность скобок (LC 1249) и монотонный стек (LC 739).
 */
const stack: PatternModule = {
  meta: {
    id: "stack",
    title: "Стек",
    category: "algorithmic",
    summary:
      "LIFO-структура: на стеке решаем парность скобок (минимум удалений, LC 1249) и «следующий тёплый день» через монотонный стек (LC 739) — за один проход O(n).",
  },
  Demo,
  Explanation,
  code: [
    {
      // Задача 1, чистый «боевой» алгоритм — то, что пишут в проде.
      filename: "solution.ts",
      language: "typescript",
      source: solutionSource,
    },
    {
      // Задача 2, монотонный стек — чистый вариант.
      filename: "dailyTemperatures.ts",
      language: "typescript",
      source: dailyTempSource,
    },
    {
      // Задача 1 с записью каждого шага для пошагового плеера.
      filename: "stack.ts",
      language: "typescript",
      source: stackSource,
    },
    {
      // Задача 2 с записью каждого шага.
      filename: "dailyTemperaturesTrace.ts",
      language: "typescript",
      source: dailyTempTraceSource,
    },
    {
      // Плеер: тумблер задач, листает шаги вперёд/назад, автопроигрывает.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default stack;
