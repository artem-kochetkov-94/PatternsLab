// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import twoPointersSource from "./twoPointers.ts?raw";
import visualizerSource from "./ArrayVisualizer.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const twoPointers: PatternModule = {
  meta: {
    id: "two-pointers",
    title: "Два указателя",
    category: "algorithmic",
    summary:
      "Два индекса идут по массиву навстречу друг другу — решает задачу за один проход без вложенных циклов.",
  },
  Demo,
  Explanation,
  code: [
    {
      // "Ядро" приёма — чистый TypeScript, генератор шагов алгоритма.
      filename: "twoPointers.ts",
      language: "typescript",
      source: twoPointersSource,
    },
    {
      // Отрисовка одного кадра визуализации (Framer Motion).
      filename: "ArrayVisualizer.tsx",
      language: "tsx",
      source: visualizerSource,
    },
    {
      // Плеер: листает шаги вперёд/назад и автопроигрывает.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default twoPointers;
