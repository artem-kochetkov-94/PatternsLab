// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке Observer в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

/**
 * Это и есть "разъём" (PatternModule), который host получит через
 * Module Federation. Именно этот файл указан в exposes vite.config.
 */
const observer: PatternModule = {
  meta: {
    id: "observer",
    title: "Observer",
    category: "behavioral",
    summary:
      "Объект-источник уведомляет всех подписчиков об изменениях своего состояния.",
  },
  Demo,
  Explanation,
};

export default observer;
