// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import microservicesSource from "./microservices.ts?raw";
import diagramSource from "./MsDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const microservicePatterns: PatternModule = {
  meta: {
    id: "microservice-patterns",
    title: "Паттерны коммуникации микросервисов",
    category: "architectural",
    summary:
      "Агрегатор (параллельно), Цепочка (последовательно), событийно-ориентированная (Event Notification / State Transfer / Event Collaboration) и отложенное выполнение задач через очередь.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: 4 сценария коммуникации + 3 разновидности event-driven + sync/async сравнение.
      filename: "microservices.ts",
      language: "typescript",
      source: microservicesSource,
    },
    {
      // Диаграмма с параллельными импульсами (delayUnits вместо индекса массива).
      filename: "MsDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Вкладки + вложенный переключатель режима + пошаговый плеер.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default microservicePatterns;
