// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import classesSource from "./classes.ts?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const databaseClasses: PatternModule = {
  meta: {
    id: "database-classes",
    title: "Классы баз данных",
    category: "architectural",
    summary:
      "OLTP / OLAP / HTAP и Persistent / In-memory — две независимые оси классификации поверх «вида» БД. Формат — классификация сценариев, а не поток запросов.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: два набора карточек-сценариев с правильным ответом и объяснением.
      filename: "classes.ts",
      language: "typescript",
      source: classesSource,
    },
    {
      // Универсальный компонент квиза + переключатель осей классификации.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default databaseClasses;
