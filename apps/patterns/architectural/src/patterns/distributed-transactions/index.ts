// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import transactionsSource from "./transactions.ts?raw";
import diagramSource from "./TxDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const distributedTransactions: PatternModule = {
  meta: {
    id: "distributed-transactions",
    title: "Консенсус: распределённые транзакции",
    category: "architectural",
    summary:
      "2PC (Prepare/Commit, с сценарием сбоя), Saga (локальные транзакции + компенсация вместо отката) и Transaction Outbox (атомарная запись в БД + надёжная публикация в очередь).",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: три паттерна, у 2PC и Saga — по два сценария (успех/сбой).
      filename: "transactions.ts",
      language: "typescript",
      source: transactionsSource,
    },
    {
      // Диаграмма с параллельными импульсами + kind "error" для отказов/rollback.
      filename: "TxDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Вкладки + переключатель сценария + пошаговый плеер.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default distributedTransactions;
