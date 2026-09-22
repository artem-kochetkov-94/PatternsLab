/**
 * CAP-теорема: в любой распределённой системе можно обеспечить не более
 * двух из трёх свойств — Consistency, Availability, Partition tolerance.
 * На практике P выбирать не приходится: сеть рвётся сама по себе, вопрос
 * не "хотим ли мы устойчивость к разделению", а "что делать, когда оно
 * случилось". Поэтому реальный выбор — не из трёх букв, а из двух путей
 * ПОСЛЕ того, как связь между узлами пропала:
 *  - CP — узел без связи с большинством отказывается отвечать, лишь бы не
 *    отдать устаревшие данные (жертвуем доступностью);
 *  - AP — узел продолжает отвечать тем, что у него есть, даже если это
 *    уже не совпадает с тем, что происходит на другой стороне разрыва
 *    (жертвуем согласованностью).
 */

export type CapMode = "CP" | "AP";

export interface CapState {
  partitioned: boolean;
  mode: CapMode;
  nodeAValue: number;
  nodeBValue: number;
}

export const INITIAL_VALUE = 100500;

export function initialCapState(): CapState {
  return { partitioned: false, mode: "CP", nodeAValue: INITIAL_VALUE, nodeBValue: INITIAL_VALUE };
}

/**
 * Запись всегда идёт в Node A. Если связь есть — она СРАЗУ видна на Node B
 * (для наглядности демо не моделирует лаг синхронной репликации отдельно).
 * Если связи нет — Node A уезжает вперёд, Node B остаётся при своём.
 */
export function writeToNodeA(state: CapState): CapState {
  const nextValue = state.nodeAValue + 1;
  return {
    ...state,
    nodeAValue: nextValue,
    nodeBValue: state.partitioned ? state.nodeBValue : nextValue,
  };
}

export interface ReadResult {
  ok: boolean;
  value?: number;
  stale: boolean;
  message: string;
}

/** Чтение всегда идёт с Node B — узла, который может оказаться отрезанным. */
export function readFromNodeB(state: CapState): ReadResult {
  if (!state.partitioned) {
    return {
      ok: true,
      value: state.nodeBValue,
      stale: false,
      message: "Связь есть, узел отвечает актуальным значением.",
    };
  }

  if (state.mode === "CP") {
    return {
      ok: false,
      stale: false,
      message:
        "Node B недоступна: без связи с Node A она не может гарантировать актуальность — и лучше откажет, чем соврёт.",
    };
  }

  const stale = state.nodeBValue !== state.nodeAValue;
  return {
    ok: true,
    value: state.nodeBValue,
    stale,
    message: stale
      ? "Node B отвечает тем, что у неё есть — но это уже не совпадает с Node A (stale read)."
      : "Node B отвечает — значения пока совпадают, разрыв ещё не успел ничего испортить.",
  };
}

export function togglePartition(state: CapState): CapState {
  if (state.partitioned) {
    // Восстановление связи = синхронизация: обе стороны сходятся к более новому значению.
    const merged = Math.max(state.nodeAValue, state.nodeBValue);
    return { ...state, partitioned: false, nodeAValue: merged, nodeBValue: merged };
  }
  return { ...state, partitioned: true };
}
