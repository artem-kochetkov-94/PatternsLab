// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import tracingSource from "./tracing.ts?raw";
import waterfallSource from "./Waterfall.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const distributedTracing: PatternModule = {
  meta: {
    id: "distributed-tracing",
    title: "Observability: распределённый трейсинг",
    category: "architectural",
    summary:
      "Один запрос — дерево вложенных спанов с началом и длительностью. Waterfall-диаграмма (как в Jaeger) сразу показывает, какой из параллельных вызовов реально определяет итоговую задержку.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: дерево спанов одного трейса + порядок их появления, без React.
      filename: "tracing.ts",
      language: "typescript",
      source: tracingSource,
    },
    {
      // Водопадная диаграмма: полоски пропорциональны времени начала/длительности.
      filename: "Waterfall.tsx",
      language: "tsx",
      source: waterfallSource,
    },
    {
      // Плеер: по одному спану на шаг.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default distributedTracing;
