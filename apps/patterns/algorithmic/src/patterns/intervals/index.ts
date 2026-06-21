// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import solutionSource from "./solution.ts?raw";
import intervalsSource from "./intervals.ts?raw";
import mergeSource from "./merge.ts?raw";
import visualizerSource from "./IntervalsVisualizer.tsx?raw";
import mergeVisualizerSource from "./MergeVisualizer.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const intervals: PatternModule = {
  meta: {
    id: "intervals",
    title: "Интервалы",
    category: "algorithmic",
    summary:
      "Сортируем отрезки и проходим за один раз: метод точек (минимум переговорок) и слияние перекрытий в острова.",
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
      // Метод точек с записью каждого шага для пошагового плеера.
      filename: "intervals.ts",
      language: "typescript",
      source: intervalsSource,
    },
    {
      // Слияние отрезков (Merge Intervals) с записью шагов для плеера.
      filename: "merge.ts",
      language: "typescript",
      source: mergeSource,
    },
    {
      // Отрисовка кадра метода точек (Framer Motion).
      filename: "IntervalsVisualizer.tsx",
      language: "tsx",
      source: visualizerSource,
    },
    {
      // Отрисовка кадра слияния отрезков (Framer Motion).
      filename: "MergeVisualizer.tsx",
      language: "tsx",
      source: mergeVisualizerSource,
    },
    {
      // Плеер: листает шаги вперёд/назад и автопроигрывает.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default intervals;
