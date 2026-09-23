// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import resilienceSource from "./resilience.ts?raw";
import diagramSource from "./RetryDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const resilience: PatternModule = {
  meta: {
    id: "resilience",
    title: "Устойчивость к сбоям",
    category: "architectural",
    summary:
      "Retries + идемпотентность + backoff, backpressure и graceful degradation / fallback — три способа не дать одному сбойному участку положить всю систему.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: сценарий ретраев, шаги backpressure, список сервисов деградации.
      filename: "resilience.ts",
      language: "typescript",
      source: resilienceSource,
    },
    {
      // Диаграмма Client/Server для вкладки Retries.
      filename: "RetryDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Три вкладки: пошаговый плеер (Retries), пошаговый плеер (Backpressure), интерактив (Degradation/Fallback).
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default resilience;
