// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import indexesSource from "./indexes.ts?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const dbIndexes: PatternModule = {
  meta: {
    id: "db-indexes",
    title: "Индексы",
    category: "architectural",
    summary:
      "BTree, Hash, Bitmap, Spatial, Reversed — пять типов индексов и к какому характеру запроса какой реально подходит.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: пять типов индексов + набор запросов с правильным ответом и объяснением.
      filename: "indexes.ts",
      language: "typescript",
      source: indexesSource,
    },
    {
      // Карточки-сценарии с выбором ответа — тот же формат, что и в предыдущих квизах.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default dbIndexes;
