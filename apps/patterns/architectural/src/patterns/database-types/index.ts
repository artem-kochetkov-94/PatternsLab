// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import typesSource from "./types.ts?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const databaseTypes: PatternModule = {
  meta: {
    id: "database-types",
    title: "Виды баз данных",
    category: "architectural",
    summary:
      "Реляционные, документные, графовые, key-value, колоночные, time series, blob store — семь моделей хранения и к какому сценарию какая реально подходит.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: семь видов БД + набор сценариев с правильным ответом и объяснением.
      filename: "types.ts",
      language: "typescript",
      source: typesSource,
    },
    {
      // Карточки-сценарии с выбором ответа — тот же формат, что и в «Классах БД».
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default databaseTypes;
