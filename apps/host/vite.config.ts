import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

// Конфигурация сборщика Vite для host-приложения.
export default defineConfig({
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
          entry: "http://localhost:3001/remoteEntry.js",
        },
        algorithmic: {
          type: "module",
          name: "algorithmic",
          entry: "http://localhost:3002/remoteEntry.js",
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
