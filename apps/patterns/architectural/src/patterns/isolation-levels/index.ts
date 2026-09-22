// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import isolationSource from "./isolation.ts?raw";
import diagramSource from "./IsolationDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const isolationLevels: PatternModule = {
  meta: {
    id: "isolation-levels",
    title: "Уровни изоляции транзакций",
    category: "architectural",
    summary:
      "Грязное чтение, неповторяющееся чтение, фантомы и потерянное обновление — какие из этих аномалий закрывает каждый уровень изоляции, на примере двух конкурентных транзакций.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Ядро: таблица предотвращённых аномалий + 4 сценария на T1/T2, без React.
      filename: "isolation.ts",
      language: "typescript",
      source: isolationSource,
    },
    {
      // Диаграмма T1 — БД — T2 с анимацией на framer-motion.
      filename: "IsolationDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Плеер: выбор аномалии + уровня изоляции + пошаговая прокрутка сценария.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default isolationLevels;
