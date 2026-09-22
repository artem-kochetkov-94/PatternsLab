// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import consistencySource from "./consistency.ts?raw";
import diagramSource from "./SyncDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const replicationConsistency: PatternModule = {
  meta: {
    id: "replication-consistency",
    title: "Репликация: синхронность и согласованность",
    category: "architectural",
    summary:
      "Sync / async / semisync / lose-less semisync — в какой момент клиент получает ACK. Плюс модели консистентности: strong, eventual, read-your-writes, monotonic reads, consistent prefix.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: 4 режима синхронности (сценарии шагов) + квиз по моделям консистентности.
      filename: "consistency.ts",
      language: "typescript",
      source: consistencySource,
    },
    {
      // Диаграмма-последовательность Client → Master → Replica с направленными ACK.
      filename: "SyncDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Вкладки: плеер по режимам синхронности + квиз по моделям консистентности.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default replicationConsistency;
