// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import formatSource from "./format.ts?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const replicationTransferFormat: PatternModule = {
  meta: {
    id: "replication-transfer-format",
    title: "Репликация: формат передачи данных",
    category: "architectural",
    summary:
      "Push vs pull (кто инициирует), statement-based vs row-based vs mixed (что едет по сети), логическая vs физическая (на каком уровне) — три независимых оси того, как изменение физически доезжает до реплики.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: три независимые оси классификации, каждая — свой квиз.
      filename: "format.ts",
      language: "typescript",
      source: formatSource,
    },
    {
      // Вкладки + переиспользуемый generic Quiz/QuizCard.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default replicationTransferFormat;
