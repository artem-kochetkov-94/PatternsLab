// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import realtimeSource from "./realtime.ts?raw";
import diagramSource from "./RealtimeDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const realtimeUpdates: PatternModule = {
  meta: {
    id: "realtime-updates",
    title: "Реалтайм-обновления",
    category: "architectural",
    summary:
      "Polling / Long Polling / Streaming — три способа узнать об изменениях на сервере, отличающиеся тем, кто и когда инициирует передачу данных.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: три режима, каждый — свой сценарий шагов.
      filename: "realtime.ts",
      language: "typescript",
      source: realtimeSource,
    },
    {
      // Диаграмма Client/Server с индикацией "ожидания" (открытое соединение).
      filename: "RealtimeDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Переключатель режима + пошаговый плеер.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default realtimeUpdates;
