// Публичная "витрина" пакета: всё, что другие проекты импортируют из @patterns-lab/core.
export type {
  CodeSample,
  PatternCategory,
  PatternMeta,
  PatternModule,
} from "./types";

export type { PatternRegistryEntry } from "./registry";
export {
  patternRegistry,
  categoryOrder,
  categoryLabels,
  getPatternById,
  getPatternsByCategory,
} from "./registry";
