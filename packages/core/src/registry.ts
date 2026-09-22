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
      id: "iterator",
      title: "Iterator",
      category: "behavioral",
      summary:
        "Даёт единый способ перебирать элементы коллекции, не раскрывая её внутреннее устройство.",
    },
    remote: "behavioral",
    exposedModule: "./Iterator",
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
  {
    meta: {
      id: "intervals",
      title: "Интервалы",
      category: "algorithmic",
      summary:
        "Сортируем отрезки и проходим за один раз: метод точек (минимум переговорок) и слияние перекрытий в острова.",
    },
    remote: "algorithmic",
    exposedModule: "./Intervals",
  },
  {
    meta: {
      id: "prefix-sum",
      title: "Префиксные суммы",
      category: "algorithmic",
      summary:
        "Предподсчёт накопленных сумм: сумма любого прямоугольника матрицы — за O(1) по формуле включений-исключений.",
    },
    remote: "algorithmic",
    exposedModule: "./PrefixSum",
  },
  {
    meta: {
      id: "binary-search",
      title: "Бинарный поиск",
      category: "algorithmic",
      summary:
        "Каждый шаг отбрасывает половину отсортированного массива — поиск за O(log n) вместо O(n).",
    },
    remote: "algorithmic",
    exposedModule: "./BinarySearch",
  },
  {
    meta: {
      id: "stack",
      title: "Стек",
      category: "algorithmic",
      summary:
        "LIFO-структура: на стеке решаем парность скобок (минимум удалений, LC 1249) и «следующий тёплый день» через монотонный стек (LC 739) — за один проход O(n).",
    },
    remote: "algorithmic",
    exposedModule: "./Stack",
  },
  {
    meta: {
      id: "merge-sort",
      title: "Сортировка слиянием",
      category: "algorithmic",
      summary:
        "«Разделяй и властвуй»: массив рекурсивно делится пополам, а затем отсортированные половины сливаются за один проход — гарантированные O(n·log n).",
    },
    remote: "algorithmic",
    exposedModule: "./MergeSort",
  },
  {
    meta: {
      id: "load-balancing",
      title: "Балансировка нагрузки",
      category: "architectural",
      summary:
        "Round Robin, Weighted Round Robin и Least Connections — как балансировщик распределяет запросы между инстансами и почему это не одно и то же.",
    },
    remote: "architectural",
    exposedModule: "./LoadBalancing",
  },
  {
    meta: {
      id: "caching",
      title: "Кэширование",
      category: "architectural",
      summary:
        "Cache-Aside vs Cache-Through (Read/Write Through): кто ходит в БД — сервис сам или кэш за него. Плюс LRU-вытеснение при переполнении кэша.",
    },
    remote: "architectural",
    exposedModule: "./Caching",
  },
  {
    meta: {
      id: "proxy",
      title: "Reverse / Forward Proxy",
      category: "architectural",
      summary:
        "Разница не в технологии, а в направлении: Forward Proxy скрывает клиента от сервера, Reverse Proxy скрывает сервер от клиента.",
    },
    remote: "architectural",
    exposedModule: "./Proxy",
  },
  {
    meta: {
      id: "circuit-breaker",
      title: "Circuit Breaker",
      category: "architectural",
      summary:
        "Автомат closed/open/half-open, который перестаёт беспокоить упавший сервис бесполезными запросами и сам пробует его восстановление.",
    },
    remote: "architectural",
    exposedModule: "./CircuitBreaker",
  },
  {
    meta: {
      id: "isolation-levels",
      title: "Уровни изоляции транзакций",
      category: "architectural",
      summary:
        "Грязное чтение, неповторяющееся чтение, фантомы и потерянное обновление — какие из этих аномалий закрывает каждый уровень изоляции, на примере двух конкурентных транзакций.",
    },
    remote: "architectural",
    exposedModule: "./IsolationLevels",
  },
  {
    meta: {
      id: "message-brokers",
      title: "Брокеры сообщений",
      category: "architectural",
      summary:
        "Kafka (pull, consumer сам забирает из лога партиции) vs RabbitMQ (push, брокер сам толкает сообщение в consumer'а) — разница в том, кто инициирует доставку.",
    },
    remote: "architectural",
    exposedModule: "./MessageBrokers",
  },
  {
    meta: {
      id: "database-classes",
      title: "Классы баз данных",
      category: "architectural",
      summary:
        "OLTP / OLAP / HTAP и Persistent / In-memory — две независимые оси классификации поверх «вида» БД. Формат — классификация сценариев, а не поток запросов.",
    },
    remote: "architectural",
    exposedModule: "./DatabaseClasses",
  },
  {
    meta: {
      id: "database-types",
      title: "Виды баз данных",
      category: "architectural",
      summary:
        "Реляционные, документные, графовые, key-value, колоночные, time series, blob store — семь моделей хранения и к какому сценарию какая реально подходит.",
    },
    remote: "architectural",
    exposedModule: "./DatabaseTypes",
  },
  {
    meta: {
      id: "db-indexes",
      title: "Индексы",
      category: "architectural",
      summary:
        "BTree, Hash, Bitmap, Spatial, Reversed — пять типов индексов и к какому характеру запроса какой реально подходит.",
    },
    remote: "architectural",
    exposedModule: "./DbIndexes",
  },
  {
    meta: {
      id: "distributed-tracing",
      title: "Observability: распределённый трейсинг",
      category: "architectural",
      summary:
        "Один запрос — дерево вложенных спанов с началом и длительностью. Waterfall-диаграмма (как в Jaeger) сразу показывает, какой из параллельных вызовов реально определяет итоговую задержку.",
    },
    remote: "architectural",
    exposedModule: "./DistributedTracing",
  },
  {
    meta: {
      id: "api-styles",
      title: "Типы API: REST vs GraphQL",
      category: "architectural",
      summary:
        "Одна и та же задача — получить пользователя и заголовки его постов — двумя способами: REST (несколько запросов, over-fetching) и GraphQL (один запрос, точные поля).",
    },
    remote: "architectural",
    exposedModule: "./ApiStyles",
  },
  {
    meta: {
      id: "replication-topologies",
      title: "Репликация: топологии",
      category: "architectural",
      summary:
        "Master-Slave, Master-Master, Master-less — кто пишет, кто читает и что происходит с записью, когда узел падает.",
    },
    remote: "architectural",
    exposedModule: "./ReplicationTopologies",
  },
  {
    meta: {
      id: "replication-consistency",
      title: "Репликация: синхронность и согласованность",
      category: "architectural",
      summary:
        "Sync / async / semisync / lose-less semisync — в какой момент клиент получает ACK. Плюс модели консистентности: strong, eventual, read-your-writes, monotonic reads, consistent prefix.",
    },
    remote: "architectural",
    exposedModule: "./ReplicationConsistency",
  },
  {
    meta: {
      id: "cap-theorem",
      title: "CAP-теорема",
      category: "architectural",
      summary:
        "Разорви связь между узлами, выбери CP или AP и попробуй прочитать с отрезанного узла — теорема не про формулу, а про то, чем жертвовать во время разрыва сети.",
    },
    remote: "architectural",
    exposedModule: "./CapTheorem",
  },
  {
    meta: {
      id: "sharding",
      title: "Шардирование",
      category: "architectural",
      summary:
        "Range/key/directory-based — три независимых способа выбрать шард. Плюс главный контраст: hash % N перемешивает почти всё при решардинге, consistent hashing — только соседей изменённого узла.",
    },
    remote: "architectural",
    exposedModule: "./Sharding",
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
