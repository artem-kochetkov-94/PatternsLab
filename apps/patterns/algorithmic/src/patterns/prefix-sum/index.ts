// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
import solutionSource from "./solution.ts?raw";
import prefixSumSource from "./prefixSum.ts?raw";
import visualizerSource from "./MatrixVisualizer.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const prefixSum: PatternModule = {
  meta: {
    id: "prefix-sum",
    title: "Префиксные суммы",
    category: "algorithmic",
    summary:
      "Предподсчёт накопленных сумм: сумма любого прямоугольника матрицы — за O(1) по формуле включений-исключений.",
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
      // Тот же приём с записью каждого шага (построение + запрос) для плеера.
      filename: "prefixSum.ts",
      language: "typescript",
      source: prefixSumSource,
    },
    {
      // Отрисовка одного кадра визуализации (Framer Motion).
      filename: "MatrixVisualizer.tsx",
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

export default prefixSum;
