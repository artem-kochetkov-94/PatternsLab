import { loadRemote } from "@module-federation/runtime";
import type { PatternModule, PatternRegistryEntry } from "@patterns-lab/core";

/**
 * Грузит модуль паттерна из нужного remote по данным реестра.
 * Превращает "./Observer" + remote "behavioral" в id "behavioral/Observer",
 * который понимает Module Federation.
 */
export async function loadPattern(
  entry: PatternRegistryEntry,
): Promise<PatternModule> {
  const exposedName = entry.exposedModule.replace(/^\.\//, "");
  const remoteId = `${entry.remote}/${exposedName}`;

  const loaded = await loadRemote<{ default: PatternModule }>(remoteId);
  if (!loaded?.default) {
    throw new Error(`Не удалось загрузить модуль паттерна: ${remoteId}`);
  }
  return loaded.default;
}
