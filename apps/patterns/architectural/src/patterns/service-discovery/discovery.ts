/**
 * Как LB узнаёт, какие бэкенды сейчас живы, — не хардкодом в конфиге, а
 * двумя механизмами, работающими вместе:
 *  - Heartbeat — каждый клиент/бэкенд периодически подтверждает, что жив;
 *    пропустил несколько подтверждений подряд — считается упавшим;
 *  - Service Discovery — реестр, в котором бэкенды сами регистрируются при
 *    запуске (Register) и который сам уведомляет LB (Notify) об изменениях
 *    состава — LB не нужно ничего перезапускать или редеплоить.
 */

export type BackendState = "starting" | "up" | "warning" | "down";

export interface DiscoveryStep {
  id: number;
  label: string;
  backendStates: Record<string, BackendState>;
  /** Активный перегон на этом шаге — для одиночного импульса. */
  activeLeg: { from: string; to: string } | null;
  description: string;
}

const ALL_UP: Record<string, BackendState> = { b1: "up", b2: "up", b3: "starting" };

export const DISCOVERY_STEPS: DiscoveryStep[] = [
  {
    id: 1,
    label: "Backend #3 запускается",
    backendStates: ALL_UP,
    activeLeg: null,
    description: "Новый инстанс поднялся, но LB о нём ещё ничего не знает.",
  },
  {
    id: 2,
    label: "Backend #3 регистрируется в Service Discovery",
    backendStates: { b1: "up", b2: "up", b3: "starting" },
    activeLeg: { from: "b3", to: "discovery" },
    description: "Register: бэкенд сам сообщает о себе реестру — никто не редактирует конфиг LB руками.",
  },
  {
    id: 3,
    label: "Service Discovery уведомляет LB",
    backendStates: { b1: "up", b2: "up", b3: "up" },
    activeLeg: { from: "discovery", to: "lb" },
    description: "Notify: реестр сам сообщает LB об изменении состава — Backend #3 теперь в ротации.",
  },
  {
    id: 4,
    label: "Backend #2 перестаёт слать heartbeat",
    backendStates: { b1: "up", b2: "warning", b3: "up" },
    activeLeg: null,
    description: "Heartbeat от Backend #2 не приходит — пока не критично, возможно временная задержка.",
  },
  {
    id: 5,
    label: "Пропущено несколько heartbeat подряд",
    backendStates: { b1: "up", b2: "down", b3: "up" },
    activeLeg: null,
    description: "Порог пропусков превышен — Backend #2 считается упавшим.",
  },
  {
    id: 6,
    label: "Service Discovery убирает Backend #2 из реестра",
    backendStates: { b1: "up", b2: "down", b3: "up" },
    activeLeg: { from: "discovery", to: "lb" },
    description: "LB узнаёт об этом так же — через Notify, а не через собственный опрос бэкендов.",
  },
];
