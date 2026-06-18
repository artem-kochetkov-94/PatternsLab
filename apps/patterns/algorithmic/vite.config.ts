import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

// Remote-приложение "algorithmic": содержит алгоритмические приёмы
// (два указателя, скользящее окно и т.д.) и отдаёт их наружу через
// Module Federation.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "algorithmic",
      // файл-"витрина", через который host забирает модули
      filename: "remoteEntry.js",
      // что отдаём наружу: ключ — публичное имя, значение — путь в коде
      exposes: {
        "./TwoPointers": "./src/patterns/two-pointers/index.ts",
      },
      // общие библиотеки: один экземпляр на host и все remote
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
  server: {
    port: 3002,
    host: true,
  },
  build: {
    target: "chrome89",
  },
});
