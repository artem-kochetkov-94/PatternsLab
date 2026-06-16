import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Конфигурация сборщика Vite для host-приложения.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    // слушать все интерфейсы (в т.ч. IPv4 127.0.0.1, а не только IPv6 ::1)
    host: true,
  },
});
