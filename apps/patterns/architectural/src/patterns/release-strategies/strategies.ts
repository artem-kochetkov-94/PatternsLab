/**
 * Три способа выкатить новую версию так, чтобы не положить продакшен.
 * Разница — в том, ЧТО происходит с трафиком, пока обновление идёт:
 *  - Rolling — заменяем инстансы по одному, router всегда шлёт трафик на
 *    ВСЕ живые инстансы сразу (и старые, и уже обновлённые).
 *  - Blue/Green — держим ДВА полных комплекта (старый и новый), router
 *    переключается на новый комплект одномоментно, целиком.
 *  - Canary — router постепенно переносит ПРОЦЕНТ трафика на новую версию,
 *    остальное продолжает идти на старую.
 */

export type ReleaseStrategyId = "rolling" | "blue-green" | "canary";

export type InstanceRole = "old" | "new";
export type InstanceTraffic = "live" | "idle" | "hidden";

export interface InstanceState {
  id: string;
  role: InstanceRole;
  traffic: InstanceTraffic;
}

export interface ReleaseStep {
  id: number;
  label: string;
  instances: InstanceState[];
  /** Подпись у стрелки router→инстанс (используется в Canary: "95%", "5%"…). */
  trafficLabels?: Record<string, string>;
  description: string;
}

export interface ReleaseStrategyDef {
  id: ReleaseStrategyId;
  label: string;
  hint: string;
  steps: ReleaseStep[];
}

const ROLLING_STEPS: ReleaseStep[] = [
  {
    id: 1,
    label: "До обновления",
    instances: [
      { id: "i1", role: "old", traffic: "live" },
      { id: "i2", role: "old", traffic: "live" },
      { id: "i3", role: "old", traffic: "live" },
    ],
    description: "Все три инстанса на старой версии, router шлёт трафик на все три.",
  },
  {
    id: 2,
    label: "Заменили первый инстанс",
    instances: [
      { id: "i1", role: "new", traffic: "live" },
      { id: "i2", role: "old", traffic: "live" },
      { id: "i3", role: "old", traffic: "live" },
    ],
    description:
      "i1 обновлён и снова в строю — router продолжает слать трафик на все живые инстансы, включая уже обновлённый.",
  },
  {
    id: 3,
    label: "Заменили второй инстанс",
    instances: [
      { id: "i1", role: "new", traffic: "live" },
      { id: "i2", role: "new", traffic: "live" },
      { id: "i3", role: "old", traffic: "live" },
    ],
    description: "Два из трёх уже на новой версии — старая и новая версии обслуживают трафик ОДНОВРЕМЕННО.",
  },
  {
    id: 4,
    label: "Готово",
    instances: [
      { id: "i1", role: "new", traffic: "live" },
      { id: "i2", role: "new", traffic: "live" },
      { id: "i3", role: "new", traffic: "live" },
    ],
    description:
      "Все инстансы обновлены по очереди — в моменте выкатки никогда не было простоя, но старая и новая версии какое-то время работали бок о бок.",
  },
];

const BLUE_GREEN_STEPS: ReleaseStep[] = [
  {
    id: 1,
    label: "Держим два полных комплекта",
    instances: [
      { id: "b1", role: "old", traffic: "live" },
      { id: "b2", role: "old", traffic: "live" },
      { id: "g1", role: "new", traffic: "idle" },
      { id: "g2", role: "new", traffic: "idle" },
    ],
    description:
      "Blue (старая версия) обслуживает весь трафик. Green (новая версия) уже полностью развёрнут и прогрет, но не получает ни одного запроса.",
  },
  {
    id: 2,
    label: "Переключаем router",
    instances: [
      { id: "b1", role: "old", traffic: "idle" },
      { id: "b2", role: "old", traffic: "idle" },
      { id: "g1", role: "new", traffic: "live" },
      { id: "g2", role: "new", traffic: "live" },
    ],
    description:
      "Router переключается на Green одномоментно, целиком. Blue остаётся развёрнутым — если что-то пошло не так, можно откатиться так же мгновенно.",
  },
];

const CANARY_STEPS: ReleaseStep[] = [
  {
    id: 1,
    label: "0% на новую версию",
    instances: [
      { id: "i1", role: "old", traffic: "live" },
      { id: "i2", role: "old", traffic: "live" },
      { id: "n1", role: "new", traffic: "idle" },
      { id: "n2", role: "new", traffic: "idle" },
    ],
    description: "Новая версия развёрнута, но трафика на неё пока нет вообще.",
  },
  {
    id: 2,
    label: "95% / 5%",
    instances: [
      { id: "i1", role: "old", traffic: "live" },
      { id: "i2", role: "old", traffic: "live" },
      { id: "n1", role: "new", traffic: "live" },
      { id: "n2", role: "new", traffic: "live" },
    ],
    trafficLabels: { old: "95%", new: "5%" },
    description:
      "На новую версию пускают маленький «канареечный» процент трафика — если она сломана, пострадает не вся аудитория.",
  },
  {
    id: 3,
    label: "70% / 30%",
    instances: [
      { id: "i1", role: "old", traffic: "live" },
      { id: "i2", role: "old", traffic: "live" },
      { id: "n1", role: "new", traffic: "live" },
      { id: "n2", role: "new", traffic: "live" },
    ],
    trafficLabels: { old: "70%", new: "30%" },
    description: "Метрики новой версии в порядке — постепенно увеличиваем её долю трафика.",
  },
  {
    id: 4,
    label: "100% на новую версию",
    instances: [
      { id: "i1", role: "old", traffic: "hidden" },
      { id: "i2", role: "old", traffic: "hidden" },
      { id: "n1", role: "new", traffic: "live" },
      { id: "n2", role: "new", traffic: "live" },
    ],
    description: "Старая версия выводится из ротации — раскатка завершена.",
  },
];

export const RELEASE_STRATEGIES: ReleaseStrategyDef[] = [
  {
    id: "rolling",
    label: "Rolling Release",
    hint: "Заменяем инстансы по одному — router всегда шлёт трафик на все живые, старые и уже обновлённые вперемешку.",
    steps: ROLLING_STEPS,
  },
  {
    id: "blue-green",
    label: "Blue/Green Release",
    hint: "Два полных комплекта одновременно — переключение router мгновенное и полностью обратимое.",
    steps: BLUE_GREEN_STEPS,
  },
  {
    id: "canary",
    label: "Canary Release",
    hint: "Новая версия получает только процент трафика — увеличиваем долю постепенно, наблюдая за метриками.",
    steps: CANARY_STEPS,
  },
];

export function getReleaseStrategy(id: ReleaseStrategyId): ReleaseStrategyDef {
  return RELEASE_STRATEGIES.find((s) => s.id === id)!;
}
