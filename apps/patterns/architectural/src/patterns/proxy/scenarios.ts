/**
 * Reverse / Forward Proxy — в отличие от балансировки и кэширования, тут нет
 * алгоритма выбора: разница между режимами чисто топологическая — на чьей
 * стороне стоит proxy и, соответственно, кого он скрывает. Поэтому вместо
 * симуляции — два готовых сценария запросов, которые эту разницу показывают.
 */

export type ProxyMode = "forward" | "reverse";

export const PROXY_MODES: { id: ProxyMode; label: string; hint: string }[] = [
  {
    id: "forward",
    label: "Forward Proxy",
    hint: "Стоит на стороне клиента: скрывает клиента от целевого сервера и может обходить ограничения доступа к нему.",
  },
  {
    id: "reverse",
    label: "Reverse Proxy",
    hint: "Стоит на стороне сервера: скрывает от клиента реальную топологию бэкендов — снаружи виден только сам proxy.",
  },
];

/** Подпись правого узла на диаграмме — у разных режимов разный смысл. */
export const PROXY_TARGET_LABEL: Record<ProxyMode, string> = {
  forward: "Target",
  reverse: "Backend",
};

export type ProxyNodeId = "client" | "proxy" | "target";

export interface ProxyStep {
  id: number;
  /** Что за запрос — показывается прямо над диаграммой. */
  label: string;
  /** Маршрут запроса. Если он короче полного пути — значит, дальше не пошли. */
  legs: [ProxyNodeId, ProxyNodeId][];
  /** true — reverse proxy ответил из своего кэша, до backend не дошли. */
  cached: boolean;
  description: string;
}

const FORWARD_STEPS: ProxyStep[] = [
  {
    id: 1,
    label: "GET instagram.com",
    legs: [
      ["client", "proxy"],
      ["proxy", "target"],
    ],
    cached: false,
    description:
      "instagram.com заблокирован для прямых обращений — но клиент и не ходит к нему напрямую. Запрос уходит на Forward Proxy, и уже ОТ ЕГО ИМЕНИ летит дальше — для целевого сервера виден только proxy.",
  },
  {
    id: 2,
    label: "GET github.com",
    legs: [
      ["client", "proxy"],
      ["proxy", "target"],
    ],
    cached: false,
    description:
      "Обычный, никем не заблокированный сайт — идёт тем же путём. Proxy теперь единственная точка выхода клиента в сеть: через неё удобно логировать трафик, фильтровать или подменять данные.",
  },
  {
    id: 3,
    label: "GET internal-tool.corp",
    legs: [
      ["client", "proxy"],
      ["proxy", "target"],
    ],
    cached: false,
    description:
      "Так же работает корпоративный прокси на работе: сотрудник физически не может обратиться в интернет иначе, чем через него.",
  },
];

const REVERSE_STEPS: ProxyStep[] = [
  {
    id: 1,
    label: "GET /home",
    legs: [
      ["client", "proxy"],
      ["proxy", "target"],
    ],
    cached: false,
    description:
      "Клиент стучится в Reverse Proxy — для него это выглядит как единственный сервер. Proxy сам решает, на какой backend перенаправить запрос; клиент о реальной топологии не знает.",
  },
  {
    id: 2,
    label: "GET /home (повтор)",
    legs: [["client", "proxy"]],
    cached: true,
    description:
      "Reverse Proxy отдал закэшированный ответ сам — до backend даже не дошли. Снаружи разницы не видно: клиент как обращался к «единственному серверу», так и обращается.",
  },
  {
    id: 3,
    label: "GET /profile",
    legs: [
      ["client", "proxy"],
      ["proxy", "target"],
    ],
    cached: false,
    description:
      "Новый путь — в кэше его нет, поэтому proxy идёт на backend как обычно.",
  },
  {
    id: 4,
    label: "POST /orders",
    legs: [
      ["client", "proxy"],
      ["proxy", "target"],
    ],
    cached: false,
    description:
      "Запросы на изменение данных Reverse Proxy не кэширует — они всегда доходят до backend.",
  },
];

export function getProxySteps(mode: ProxyMode): ProxyStep[] {
  return mode === "forward" ? FORWARD_STEPS : REVERSE_STEPS;
}
