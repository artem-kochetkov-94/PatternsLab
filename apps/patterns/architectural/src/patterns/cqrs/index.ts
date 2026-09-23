// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import cqrsSource from "./cqrs.ts?raw";
import diagramSource from "./CqrsDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const cqrs: PatternModule = {
  meta: {
    id: "cqrs",
    title: "CQRS",
    category: "architectural",
    summary:
      "Command Query Responsibility Segregation: разделяем запись и чтение на разные сервисы, чтобы масштабировать и оптимизировать их независимо друг от друга.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: список действий (запись/чтение).
      filename: "cqrs.ts",
      language: "typescript",
      source: cqrsSource,
    },
    {
      // Диаграмма: единый сервис vs разделённые Reader/Writer.
      filename: "CqrsDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Интерактив: переключатель CQRS + кнопки действий (не пошаговый сценарий).
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default cqrs;
