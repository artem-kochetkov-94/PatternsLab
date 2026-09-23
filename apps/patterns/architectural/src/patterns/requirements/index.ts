// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import requirementsSource from "./requirements.ts?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const requirements: PatternModule = {
  meta: {
    id: "requirements",
    title: "Функциональные vs нефункциональные требования",
    category: "architectural",
    summary:
      "ЧТО система должна делать (функциональные) против КАКИМИ свойствами она должна обладать (нефункциональные) — квиз по восьми сценариям.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: 8 сценариев-требований с ответом и объяснением.
      filename: "requirements.ts",
      language: "typescript",
      source: requirementsSource,
    },
    {
      // Квиз-карточки (без диаграммы — формат классификации, а не потока).
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default requirements;
