import type { PatternCategory, PatternMeta } from "./types";

/**
 * Одна запись реестра = описание паттерна (meta) + адрес, где его взять.
 * Host читает реестр, строит меню и по этим полям понимает,
 * какой remote и какой модуль внутри него подгружать.
 */
export interface PatternRegistryEntry {
  /** Метаданные паттерна для каталога/меню. */
  meta: PatternMeta;
  /** Имя remote-приложения (микрофронтенда), напр. "behavioral". */
  remote: string;
  /** Какой модуль этот remote отдаёт наружу, напр. "./Observer". */
  exposedModule: string;
}

/**
 * Единый список всех паттернов платформы.
 * Добавить новый паттерн = дописать сюда одну запись.
 */
export const patternRegistry: PatternRegistryEntry[] = [
  {
    meta: {
      id: "observer",
      title: "Observer",
      category: "behavioral",
      summary:
        "Объект-источник уведомляет всех подписчиков об изменениях своего состояния.",
    },
    remote: "behavioral",
    exposedModule: "./Observer",
  },
  {
    meta: {
      id: "chain-of-responsibility",
      title: "Chain of Responsibility",
      category: "behavioral",
      summary:
        "Запрос идёт по цепочке обработчиков, пока один из них его не обработает.",
    },
    remote: "behavioral",
    exposedModule: "./ChainOfResponsibility",
  },
  {
    meta: {
      id: "command",
      title: "Command",
      category: "behavioral",
      summary:
        "Превращает действие в объект — его можно отменить, поставить в очередь и логировать.",
    },
    remote: "behavioral",
    exposedModule: "./Command",
  },
  {
    meta: {
      id: "two-pointers",
      title: "Два указателя",
      category: "algorithmic",
      summary:
        "Два индекса идут по массиву навстречу друг другу — решает задачу за один проход без вложенных циклов.",
    },
    remote: "algorithmic",
    exposedModule: "./TwoPointers",
  },
];

/**
 * Единственный источник правды по категориям: их порядок и названия.
 * Меню, каталог и заголовки берут данные отсюда — добавить категорию
 * = дописать одну строку сюда (и больше нигде).
 */
export const categoryOrder: { id: PatternCategory; label: string }[] = [
  { id: "creational", label: "Порождающие" },
  { id: "structural", label: "Структурные" },
  { id: "behavioral", label: "Поведенческие" },
  { id: "architectural", label: "Архитектурные" },
  { id: "algorithmic", label: "Алгоритмические приёмы" },
];

/** Человекочитаемые названия категорий — для быстрого поиска по id. */
export const categoryLabels = Object.fromEntries(
  categoryOrder.map((c) => [c.id, c.label]),
) as Record<PatternCategory, string>;

/** Найти запись паттерна по его id. */
export function getPatternById(id: string): PatternRegistryEntry | undefined {
  return patternRegistry.find((entry) => entry.meta.id === id);
}

/** Получить все паттерны одной категории. */
export function getPatternsByCategory(
  category: PatternCategory,
): PatternRegistryEntry[] {
  return patternRegistry.filter((entry) => entry.meta.category === category);
}
