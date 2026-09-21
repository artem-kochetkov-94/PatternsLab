// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import strategiesSource from "./strategies.ts?raw";
import diagramSource from "./CacheDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const caching: PatternModule = {
  meta: {
    id: "caching",
    title: "Кэширование",
    category: "architectural",
    summary:
      "Cache-Aside vs Cache-Through (Read/Write Through): кто ходит в БД — сервис сам или кэш за него. Плюс LRU-вытеснение при переполнении кэша.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Ядро: событийная симуляция двух стратегий + LRU, без React.
      filename: "strategies.ts",
      language: "typescript",
      source: strategiesSource,
    },
    {
      // Диаграмма Service ↔ Cache ↔ DB с анимацией на framer-motion.
      filename: "CacheDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Плеер: переключатель стратегий + пошаговая прокрутка операций.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default caching;
