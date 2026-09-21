// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import circuitBreakerSource from "./circuitBreaker.ts?raw";
import diagramSource from "./CircuitBreakerDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const circuitBreaker: PatternModule = {
  meta: {
    id: "circuit-breaker",
    title: "Circuit Breaker",
    category: "architectural",
    summary:
      "Автомат closed/open/half-open, который перестаёт беспокоить упавший сервис бесполезными запросами и сам пробует его восстановление.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Ядро: state machine + счётчик отказов, без React.
      filename: "circuitBreaker.ts",
      language: "typescript",
      source: circuitBreakerSource,
    },
    {
      // Диаграмма: автомат состояний сверху + маршрут запроса снизу.
      filename: "CircuitBreakerDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Плеер: пошаговая прокрутка таймлайна запросов.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default circuitBreaker;
