// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import mapreduceSource from "./mapreduce.ts?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const mapReduce: PatternModule = {
  meta: {
    id: "map-reduce",
    title: "MapReduce",
    category: "architectural",
    summary:
      "Word count пошагово: Cut → Map → Shuffle → Reduce. Как задача обработки текста разбивается на независимо параллелящиеся фазы.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: пример word count, готовые результаты каждой фазы.
      filename: "mapreduce.ts",
      language: "typescript",
      source: mapreduceSource,
    },
    {
      // Колоночный пайплайн (не сетевая диаграмма) с пошаговым раскрытием фаз.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default mapReduce;
