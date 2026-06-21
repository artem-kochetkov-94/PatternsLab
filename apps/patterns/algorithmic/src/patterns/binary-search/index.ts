// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
import solutionSource from "./solution.ts?raw";
import binarySearchSource from "./binarySearch.ts?raw";
import visualizerSource from "./BinarySearchVisualizer.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const binarySearch: PatternModule = {
  meta: {
    id: "binary-search",
    title: "Бинарный поиск",
    category: "algorithmic",
    summary:
      "Каждый шаг отбрасывает половину отсортированного массива — поиск за O(log n) вместо O(n).",
  },
  Demo,
  Explanation,
  code: [
    {
      // Чистый алгоритм без обвязки под визуализацию — то, что пишут в проде.
      filename: "solution.ts",
      language: "typescript",
      source: solutionSource,
    },
    {
      // Тот же приём с записью каждого шага для пошагового плеера.
      filename: "binarySearch.ts",
      language: "typescript",
      source: binarySearchSource,
    },
    {
      // Отрисовка одного кадра визуализации (Framer Motion).
      filename: "BinarySearchVisualizer.tsx",
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

export default binarySearch;
