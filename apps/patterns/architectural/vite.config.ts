import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

// На GitHub Pages этот remote лежит в подпапке /PatternsLab/architectural/,
// поэтому его статика (remoteEntry.js и чанки) должна ссылаться туда же.
const isPages = process.env.DEPLOY_TARGET === "pages";

// Remote-приложение "architectural": архитектурные паттерны и подходы
// (балансировка нагрузки, кэширование, проксирование и т.д.), отдаёт их
// наружу через Module Federation.
export default defineConfig({
  base: isPages ? "/PatternsLab/architectural/" : "/",
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "architectural",
      // файл-"витрина", через который host забирает модули
      filename: "remoteEntry.js",
      // что отдаём наружу: ключ — публичное имя, значение — путь в коде
      exposes: {
        "./LoadBalancing": "./src/patterns/load-balancing/index.ts",
        "./Caching": "./src/patterns/caching/index.ts",
        "./Proxy": "./src/patterns/proxy/index.ts",
        "./CircuitBreaker": "./src/patterns/circuit-breaker/index.ts",
      },
      // общие библиотеки: один экземпляр на host и все remote
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
  server: {
    port: 3003,
    host: true,
  },
  build: {
    target: "chrome89",
  },
});
