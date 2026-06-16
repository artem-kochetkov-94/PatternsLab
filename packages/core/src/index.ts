// Публичная "витрина" пакета: всё, что другие проекты импортируют из @patterns-lab/core.
export type {
  PatternCategory,
  PatternMeta,
  PatternModule,
} from "./types";

export type { PatternRegistryEntry } from "./registry";
export {
  patternRegistry,
  categoryLabels,
  getPatternById,
  getPatternsByCategory,
} from "./registry";
