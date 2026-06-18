import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

// Сборка под GitHub Pages включается переменной DEPLOY_TARGET=pages.
// Тогда всё приложение живёт по адресу <user>.github.io/PatternsLab/,
// а remote-ы лежат в подпапках того же сайта.
const isPages = process.env.DEPLOY_TARGET === "pages";
const PAGES_ORIGIN = "https://artem-kochetkov-94.github.io/PatternsLab";

// Где host берёт remote-ы: в проде — статикой с Pages, в dev — с localhost.
const remoteEntry = (name: string, devPort: number) =>
  isPages
    ? `${PAGES_ORIGIN}/${name}/remoteEntry.js`
    : `http://localhost:${devPort}/remoteEntry.js`;

// Конфигурация сборщика Vite для host-приложения.
export default defineConfig({
  // На Pages сайт отдаётся из /PatternsLab/, локально — из корня.
  base: isPages ? "/PatternsLab/" : "/",
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "host",
      // remote-приложения, которые host умеет подгружать.
      // Ключ "behavioral" = имя, по которому грузим: loadRemote("behavioral/Observer").
      remotes: {
        behavioral: {
          type: "module",
          name: "behavioral",
          entry: remoteEntry("behavioral", 3001),
        },
        algorithmic: {
          type: "module",
          name: "algorithmic",
          entry: remoteEntry("algorithmic", 3002),
        },
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
  server: {
    port: 3000,
    // слушать все интерфейсы (в т.ч. IPv4 127.0.0.1, а не только IPv6 ::1)
    host: true,
  },
  build: {
    target: "chrome89",
  },
});
