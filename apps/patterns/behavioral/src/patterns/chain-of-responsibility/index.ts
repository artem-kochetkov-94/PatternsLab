// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import approvalSource from "./approval.ts?raw";
import approvalDemoSource from "./ApprovalDemo.tsx?raw";
import validationSource from "./validation.ts?raw";
import validationDemoSource from "./ValidationDemo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const chainOfResponsibility: PatternModule = {
  meta: {
    id: "chain-of-responsibility",
    title: "Chain of Responsibility",
    category: "behavioral",
    summary:
      "Запрос идёт по цепочке обработчиков, пока один из них его не обработает.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Ядро примера "first-match" — чистый TypeScript. С него и стоит начать.
      filename: "approval.ts",
      language: "typescript",
      source: approvalSource,
    },
    {
      // Как это ядро используется в UI (демо согласования).
      filename: "ApprovalDemo.tsx",
      language: "tsx",
      source: approvalDemoSource,
    },
    {
      // Ядро примеров "fail-fast" и "collect-all" — та же цепочка, разные режимы.
      filename: "validation.ts",
      language: "typescript",
      source: validationSource,
    },
    {
      // Демо валидации формы (оба режима).
      filename: "ValidationDemo.tsx",
      language: "tsx",
      source: validationDemoSource,
    },
  ],
};

export default chainOfResponsibility;
