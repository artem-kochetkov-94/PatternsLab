import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

// Remote-приложение "behavioral": содержит поведенческие паттерны
// и отдаёт их наружу через Module Federation.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "behavioral",
      // файл-"витрина", через который host забирает модули
      filename: "remoteEntry.js",
      // что отдаём наружу: ключ — публичное имя, значение — путь в коде
      exposes: {
        "./Observer": "./src/patterns/observer/index.ts",
        "./ChainOfResponsibility":
          "./src/patterns/chain-of-responsibility/index.ts",
        "./Command": "./src/patterns/command/index.ts",
      },
      // общие библиотеки: один экземпляр на host и все remote
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
  server: {
    port: 3001,
    host: true,
  },
  build: {
    target: "chrome89",
  },
});
