// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым,
// поэтому на экран попадает ровно та реализация, что крутится в демо.
import iteratorSource from "./iterator.ts?raw";
import treeDemoSource from "./TreeDemo.tsx?raw";
import sequenceSource from "./sequence.ts?raw";
import sequenceDemoSource from "./SequenceDemo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const iterator: PatternModule = {
  meta: {
    id: "iterator",
    title: "Iterator",
    category: "behavioral",
    summary:
      "Даёт единый способ перебирать элементы коллекции, не раскрывая её внутреннее устройство.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Ядро GoF: дерево + итераторы разных стратегий обхода.
      filename: "iterator.ts",
      language: "typescript",
      source: iteratorSource,
    },
    {
      // Визуализация обхода дерева с плеером шагов.
      filename: "TreeDemo.tsx",
      language: "tsx",
      source: treeDemoSource,
    },
    {
      // Тот же паттерн средствами языка: Symbol.iterator + ленивые генераторы.
      filename: "sequence.ts",
      language: "typescript",
      source: sequenceSource,
    },
    {
      // Демо протокола итерации JS.
      filename: "SequenceDemo.tsx",
      language: "tsx",
      source: sequenceDemoSource,
    },
  ],
};

export default iterator;
