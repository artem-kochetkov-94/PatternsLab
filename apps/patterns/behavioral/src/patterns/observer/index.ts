// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке Observer в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import observerSource from "./observer.ts?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * Это и есть "разъём" (PatternModule), который host получит через
 * Module Federation. Именно этот файл указан в exposes vite.config.
 */
const observer: PatternModule = {
  meta: {
    id: "observer",
    title: "Observer",
    category: "behavioral",
    summary:
      "Объект-источник уведомляет всех подписчиков об изменениях своего состояния.",
  },
  Demo,
  Explanation,
  code: [
    {
      // "Ядро" паттерна — чистый TypeScript, без React. С него и стоит начать.
      filename: "observer.ts",
      language: "typescript",
      source: observerSource,
    },
    {
      // Как это ядро используется в реальном UI (React-демо рядом на странице).
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default observer;
