/**
 * Брокеры сообщений: Kafka и RabbitMQ решают одну и ту же задачу
 * (буферизация, асинхронная связь, слабое связывание producer/consumer),
 * но КТО инициирует финальную доставку — принципиально разный вопрос.
 *  - Kafka — pull: consumer сам приходит и забирает следующую порцию,
 *    когда ему удобно; лог партиции при этом не удаляется (retention).
 *  - RabbitMQ — push: как только сообщение долетело до очереди, брокер
 *    сам толкает его consumer'у; из очереди сообщение при этом исчезает.
 */

export type BrokerMode = "kafka" | "rabbitmq";

export const BROKER_MODES: { id: BrokerMode; label: string; hint: string }[] = [
  {
    id: "kafka",
    label: "Kafka",
    hint: "Pull: consumer сам решает, когда забрать следующую порцию сообщений из партиции — брокер ничего не проталкивает.",
  },
  {
    id: "rabbitmq",
    label: "RabbitMQ",
    hint: "Push: как только сообщение попало в очередь, брокер сам доставляет его consumer'у — тому не нужно ничего спрашивать.",
  },
];

export interface BrokerNode {
  id: string;
  label: string;
}

export const BROKER_NODES: Record<BrokerMode, BrokerNode[]> = {
  kafka: [
    { id: "producer", label: "Producer" },
    { id: "topic", label: "Topic" },
    { id: "consumer", label: "Consumer" },
  ],
  rabbitmq: [
    { id: "producer", label: "Producer" },
    { id: "exchange", label: "Exchange" },
    { id: "queue", label: "Queue" },
    { id: "consumer", label: "Consumer" },
  ],
};

/**
 * Тот же словарь перегонов, что и в кэшировании: read — полноценный обмен
 * запрос/ответ (consumer сам спросил и сам получил данные); write — данные
 * едут только вперёд; response — данные едут вперёд САМИ ПО СЕБЕ, без
 * запроса в этом же перегоне, — то есть ровно то, что делает push.
 */
export type BrokerLegKind = "read" | "write" | "response";

export interface BrokerLeg {
  from: string;
  to: string;
  kind: BrokerLegKind;
}

export interface BrokerMessage {
  id: string;
  /** true — сообщение уже доставлено consumer'у (Kafka: прочитано; RabbitMQ: вытолкнуто). */
  delivered: boolean;
}

export interface BrokerStep {
  id: number;
  label: string;
  legs: BrokerLeg[];
  /** Что физически лежит у брокера ПОСЛЕ этого шага. */
  brokerState: BrokerMessage[];
  description: string;
}

const KAFKA_STEPS: BrokerStep[] = [
  {
    id: 1,
    label: "Producer публикует message #1",
    legs: [{ from: "producer", to: "topic", kind: "write" }],
    brokerState: [{ id: "#1", delivered: false }],
    description:
      "Producer пишет сообщение в конец лога партиции и не ждёт, пока его кто-то прочитает.",
  },
  {
    id: 2,
    label: "Producer публикует message #2",
    legs: [{ from: "producer", to: "topic", kind: "write" }],
    brokerState: [
      { id: "#1", delivered: false },
      { id: "#2", delivered: false },
    ],
    description: "Ещё одно сообщение — лог растёт независимо от того, читает ли его кто-то.",
  },
  {
    id: 3,
    label: "Consumer запрашивает следующую порцию",
    legs: [{ from: "consumer", to: "topic", kind: "read" }],
    brokerState: [
      { id: "#1", delivered: true },
      { id: "#2", delivered: true },
    ],
    description:
      "Consumer сам решает, когда ему удобно, и запрашивает у топика сообщения начиная со своего оффсета — получает #1 и #2 разом. Сами сообщения из лога никуда не делись.",
  },
  {
    id: 4,
    label: "Producer публикует message #3",
    legs: [{ from: "producer", to: "topic", kind: "write" }],
    brokerState: [
      { id: "#1", delivered: true },
      { id: "#2", delivered: true },
      { id: "#3", delivered: false },
    ],
    description: "Producer продолжает писать — consumer прямо сейчас ничего не получает.",
  },
  {
    id: 5,
    label: "Consumer запрашивает снова",
    legs: [{ from: "consumer", to: "topic", kind: "read" }],
    brokerState: [
      { id: "#1", delivered: true },
      { id: "#2", delivered: true },
      { id: "#3", delivered: true },
    ],
    description:
      "Только когда consumer снова обратится сам, он получит message #3 — и ни секундой раньше.",
  },
];

const RABBITMQ_STEPS: BrokerStep[] = [
  {
    id: 1,
    label: "Producer публикует message #1",
    legs: [
      { from: "producer", to: "exchange", kind: "write" },
      { from: "exchange", to: "queue", kind: "write" },
    ],
    brokerState: [{ id: "#1", delivered: false }],
    description: "Producer отправляет сообщение в exchange, тот по правилам маршрутизации кладёт его в очередь.",
  },
  {
    id: 2,
    label: "Брокер сам доставляет message #1",
    legs: [{ from: "queue", to: "consumer", kind: "response" }],
    brokerState: [],
    description:
      "Consumer ничего не спрашивал — брокер сам протолкнул сообщение, как только оно оказалось в очереди. Из очереди оно тут же исчезает.",
  },
  {
    id: 3,
    label: "Producer публикует message #2",
    legs: [
      { from: "producer", to: "exchange", kind: "write" },
      { from: "exchange", to: "queue", kind: "write" },
    ],
    brokerState: [{ id: "#2", delivered: false }],
    description: "Новое сообщение снова проходит через exchange в очередь.",
  },
  {
    id: 4,
    label: "Брокер сам доставляет message #2",
    legs: [{ from: "queue", to: "consumer", kind: "response" }],
    brokerState: [],
    description: "И снова push: момент доставки решает брокер, а не consumer.",
  },
];

export function getBrokerSteps(mode: BrokerMode): BrokerStep[] {
  return mode === "kafka" ? KAFKA_STEPS : RABBITMQ_STEPS;
}
