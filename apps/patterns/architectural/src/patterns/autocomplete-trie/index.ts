// Важно: CSS не передаётся через Module Federation автоматически.
// Подключаем стили remote-а прямо в экспортируемый модуль, чтобы при
// загрузке паттерна в host вместе с JS подъехал и его Tailwind-CSS.
import "../../index.css";

import type { PatternModule } from "@patterns-lab/core";
import { Demo } from "./Demo";
import { Explanation } from "./Explanation";

// `?raw` — фишка Vite: импортирует файл как СТРОКУ с его содержимым.
// Так на экран попадает ровно та реализация, что крутится в демо рядом.
import trieSource from "./trie.ts?raw";
import diagramSource from "./TrieDiagram.tsx?raw";
import demoSource from "./Demo.tsx?raw";

/**
 * "Разъём" (PatternModule), который host получит через Module Federation.
 * Именно этот файл указан в exposes vite.config.
 */
const autocompleteTrie: PatternModule = {
  meta: {
    id: "autocomplete-trie",
    title: "Автодополнение: Trie",
    category: "architectural",
    summary:
      "Сжатое префиксное дерево (radix tree) с частотами на листьях — вводишь префикс, видишь путь по дереву и подсказки, отсортированные по популярности.",
  },
  Demo,
  Explanation,
  code: [
    {
      // Данные: узлы дерева + поиск совпадений по введённому префиксу.
      filename: "trie.ts",
      language: "typescript",
      source: trieSource,
    },
    {
      // Диаграмма дерева с подсветкой пути.
      filename: "TrieDiagram.tsx",
      language: "tsx",
      source: diagramSource,
    },
    {
      // Поле ввода префикса + список подсказок.
      filename: "Demo.tsx",
      language: "tsx",
      source: demoSource,
    },
  ],
};

export default autocompleteTrie;
