import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

// Два продовых адреса: "pages" — проектная страница /PatternsLab/algorithmic/,
// "userpage" — корень пользовательского сайта, /algorithmic/.
const deployTarget = process.env.DEPLOY_TARGET;

// Remote-приложение "algorithmic": содержит алгоритмические приёмы
// (два указателя, скользящее окно и т.д.) и отдаёт их наружу через
// Module Federation.
export default defineConfig({
  base:
    deployTarget === "pages"
      ? "/PatternsLab/algorithmic/"
      : deployTarget === "userpage"
        ? "/algorithmic/"
        : "/",
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
        "./Intervals": "./src/patterns/intervals/index.ts",
        "./PrefixSum": "./src/patterns/prefix-sum/index.ts",
        "./BinarySearch": "./src/patterns/binary-search/index.ts",
        "./Stack": "./src/patterns/stack/index.ts",
        "./MergeSort": "./src/patterns/merge-sort/index.ts",
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
