// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import shardingSource from "./sharding.ts?raw";
import ringSource from "./ShardRing.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const sharding: PatternModule = {
  meta: {
    id: "sharding",
    title: "Шардирование",
    category: "architectural",
    summary:
      "Range/key/directory-based — три независимых способа выбрать шард. Плюс главный контраст: hash % N перемешивает почти всё при решардинге, consistent hashing — только соседей изменённого узла.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: три способа шардирования на одном наборе строк + логика кольца/mod-хэша.
      filename: "sharding.ts",
      language: "typescript",
      source: shardingSource,
    },
    {
      // Кольцо consistent hashing: шарды и ключи на окружности, клик — вкл/выкл шард.
      filename: "ShardRing.tsx",
      language: "tsx",
      source: ringSource,
    },
    {
      // Вкладки: сравнение способов шардирования + hash%N vs consistent hashing рядом.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default sharding;
