// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import throttleSource from "./throttle.ts?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const throttlingDebouncing: PatternModule = {
  meta: {
    id: "throttling-debouncing",
    title: "Throttling / Debouncing",
    category: "architectural",
    summary:
      "Кликай быстро подряд и смотри вживую: throttle реагирует равномерно по ходу серии событий, debounce — только один раз, после того как события прекратились.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Реальные реализации throttle/debounce — не имитация, настоящие таймеры.
      filename: "throttle.ts",
      language: "typescript",
      source: throttleSource,
    },
    {
      // Кнопки + три временные шкалы (raw/throttled/debounced), обновляются в реальном времени.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default throttlingDebouncing;
