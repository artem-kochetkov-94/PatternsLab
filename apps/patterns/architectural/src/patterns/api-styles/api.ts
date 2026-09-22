/**
 * REST vs GraphQL на одной и той же задаче: "получить имя пользователя и
 * заголовки его 3 последних постов". REST устроен вокруг ресурсов — чтобы
 * собрать экран, часто нужно несколько запросов, и каждый отдаёт объект
 * целиком (over-fetching). GraphQL — один запрос с точным списком полей.
 */

export type ApiStyle = "rest" | "graphql";

export const API_STYLES: { id: ApiStyle; label: string; hint: string }[] = [
  {
    id: "rest",
    label: "REST",
    hint: "Ресурс = URL. Чтобы собрать один экран, часто нужно несколько запросов — и каждый отдаёт объект целиком, лишние поля выбрасываются уже на клиенте.",
  },
  {
    id: "graphql",
    label: "GraphQL",
    hint: "Один запрос с точным списком нужных полей — сервер отдаёт ровно то, что попросили, и ничего лишнего.",
  },
];

export interface ApiStep {
  id: number;
  label: string;
  request: string;
  response: string;
  description: string;
}

const REST_STEPS: ApiStep[] = [
  {
    id: 1,
    label: "Запрос 1 из 2 — GET /users/42",
    request: "GET /users/42",
    response: `{
  "id": 42,
  "name": "Ирина",
  "email": "irina@example.com",
  "phone": "+7 900 000-00-00",
  "address": "Москва, ...",
  "bio": "Люблю читать и путешествовать..."
}`,
    description:
      "Экрану нужно только имя — но REST отдаёт весь объект пользователя целиком: email, телефон, адрес, био уйдут в мусор на клиенте.",
  },
  {
    id: 2,
    label: "Запрос 2 из 2 — GET /users/42/posts?limit=3",
    request: "GET /users/42/posts?limit=3",
    response: `[
  { "id": 1, "title": "Заголовок 1", "body": "...текст поста...", "createdAt": "...", "tags": [...] },
  { "id": 2, "title": "Заголовок 2", "body": "...текст поста...", "createdAt": "...", "tags": [...] },
  { "id": 3, "title": "Заголовок 3", "body": "...текст поста...", "createdAt": "...", "tags": [...] }
]`,
    description:
      "Второй отдельный запрос — и снова лишнее: нужен был только title, а прилетел весь текст поста, дата и теги для каждого из трёх постов.",
  },
];

const GRAPHQL_STEPS: ApiStep[] = [
  {
    id: 1,
    label: "Один запрос — POST /graphql",
    request: `query {
  user(id: 42) {
    name
    posts(limit: 3) {
      title
    }
  }
}`,
    response: `{
  "data": {
    "user": {
      "name": "Ирина",
      "posts": [
        { "title": "Заголовок 1" },
        { "title": "Заголовок 2" },
        { "title": "Заголовок 3" }
      ]
    }
  }
}`,
    description:
      "Один запрос, один ответ — ровно те поля, что были нужны экрану, и ни байтом больше. Клиент сам решает форму ответа прямо в запросе.",
  },
];

export function getApiSteps(style: ApiStyle): ApiStep[] {
  return style === "rest" ? REST_STEPS : GRAPHQL_STEPS;
}
