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
        "./IsolationLevels": "./src/patterns/isolation-levels/index.ts",
        "./MessageBrokers": "./src/patterns/message-brokers/index.ts",
        "./DatabaseClasses": "./src/patterns/database-classes/index.ts",
        "./DatabaseTypes": "./src/patterns/database-types/index.ts",
        "./DbIndexes": "./src/patterns/db-indexes/index.ts",
        "./DistributedTracing": "./src/patterns/distributed-tracing/index.ts",
        "./ApiStyles": "./src/patterns/api-styles/index.ts",
        "./ReplicationTopologies": "./src/patterns/replication-topologies/index.ts",
        "./ReplicationConsistency": "./src/patterns/replication-consistency/index.ts",
        "./ReplicationTransferFormat": "./src/patterns/replication-transfer-format/index.ts",
        "./CapTheorem": "./src/patterns/cap-theorem/index.ts",
        "./Sharding": "./src/patterns/sharding/index.ts",
        "./ReleaseStrategies": "./src/patterns/release-strategies/index.ts",
        "./MicroservicePatterns": "./src/patterns/microservice-patterns/index.ts",
        "./Resilience": "./src/patterns/resilience/index.ts",
        "./ServiceDiscovery": "./src/patterns/service-discovery/index.ts",
        "./Cqrs": "./src/patterns/cqrs/index.ts",
        "./RealtimeUpdates": "./src/patterns/realtime-updates/index.ts",
        "./MapReduce": "./src/patterns/map-reduce/index.ts",
        "./AutocompleteTrie": "./src/patterns/autocomplete-trie/index.ts",
        "./ThrottlingDebouncing": "./src/patterns/throttling-debouncing/index.ts",
        "./DistributedTransactions": "./src/patterns/distributed-transactions/index.ts",
        "./LocksLeaderElection": "./src/patterns/locks-leader-election/index.ts",
        "./Requirements": "./src/patterns/requirements/index.ts",
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
