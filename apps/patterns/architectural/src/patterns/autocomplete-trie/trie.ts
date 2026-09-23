/**
 * Автодополнение — классическая задача поиска по префиксу, и классическая
 * структура для неё — Trie (префиксное дерево), точнее — его сжатая
 * версия (radix tree): общие последовательности символов схлопываются в
 * одно ребро, а не хранятся по символу на узел.
 *
 * На каждом листе — счётчик популярности (сколько раз это слово реально
 * искали), чтобы подсказки сортировались по частоте, а не по алфавиту.
 */

export interface TrieNode {
  id: string;
  /** Символы на этом ребре (может быть несколько — "ривет", а не по одной букве). */
  label: string;
  parentId: string | null;
  /** Заполнено только у листьев — итоговое слово целиком и его популярность. */
  leaf: { word: string; count: number } | null;
  pos: { x: number; y: number };
}

export const TRIE_NODES: TrieNode[] = [
  { id: "root", label: "", parentId: null, leaf: null, pos: { x: 300, y: 30 } },
  { id: "p", label: "п", parentId: "root", leaf: null, pos: { x: 190, y: 100 } },
  { id: "privet", label: "ривет", parentId: "p", leaf: { word: "привет", count: 10 }, pos: { x: 90, y: 180 } },
  { id: "po", label: "о", parentId: "p", leaf: null, pos: { x: 280, y: 180 } },
  { id: "pochta", label: "чта", parentId: "po", leaf: { word: "почта", count: 5 }, pos: { x: 220, y: 250 } },
  { id: "poka", label: "ка", parentId: "po", leaf: { word: "пока", count: 4 }, pos: { x: 340, y: 250 } },
  { id: "may", label: "май", parentId: "root", leaf: { word: "май", count: 2 }, pos: { x: 460, y: 100 } },
];

export function getNode(id: string): TrieNode {
  return TRIE_NODES.find((n) => n.id === id)!;
}

/** Полное слово по пути от корня до узла (конкатенация меток по пути). */
function wordUpTo(node: TrieNode): string {
  let cur: TrieNode | undefined = node;
  const parts: string[] = [];
  while (cur && cur.id !== "root") {
    parts.unshift(cur.label);
    cur = cur.parentId ? getNode(cur.parentId) : undefined;
  }
  return parts.join("");
}

export interface PrefixMatch {
  /** id узлов на пути, покрывающих введённый префикс (для подсветки). */
  highlightedNodeIds: Set<string>;
  suggestions: { word: string; count: number }[];
}

/** Ищем все листья, чьё слово начинается с введённого префикса, и путь до них для подсветки. */
export function matchPrefix(prefix: string): PrefixMatch {
  const normalized = prefix.trim().toLowerCase();
  const highlightedNodeIds = new Set<string>();
  const suggestions: { word: string; count: number }[] = [];

  if (!normalized) {
    return { highlightedNodeIds, suggestions };
  }

  for (const node of TRIE_NODES) {
    if (!node.leaf) continue;
    const word = wordUpTo(node);
    if (word.startsWith(normalized)) {
      suggestions.push({ word, count: node.leaf.count });
      // подсвечиваем путь от корня до этого листа
      let cur: TrieNode | undefined = node;
      while (cur) {
        highlightedNodeIds.add(cur.id);
        cur = cur.parentId ? getNode(cur.parentId) : undefined;
      }
    }
  }

  suggestions.sort((a, b) => b.count - a.count);
  return { highlightedNodeIds, suggestions };
}
