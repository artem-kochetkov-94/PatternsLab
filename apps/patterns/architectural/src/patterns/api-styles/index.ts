// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import apiSource from "./api.ts?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const apiStyles: PatternModule = {
  meta: {
    id: "api-styles",
    title: "Типы API: REST vs GraphQL",
    category: "architectural",
    summary:
      "Одна и та же задача — получить пользователя и заголовки его постов — двумя способами: REST (несколько запросов, over-fetching) и GraphQL (один запрос, точные поля).",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: сценарии запрос/ответ для REST и GraphQL на одной задаче.
      filename: "api.ts",
      language: "typescript",
      source: apiSource,
    },
    {
      // Переключатель стиля + карточки запрос/ответ.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default apiStyles;
