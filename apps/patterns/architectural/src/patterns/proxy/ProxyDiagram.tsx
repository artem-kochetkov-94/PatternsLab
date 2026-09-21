import { motion } from "framer-motion";
import {
  PROXY_TARGET_LABEL,
  type ProxyMode,
  type ProxyNodeId,
  type ProxyStep,
} from "./scenarios";

// Тот же приём, что в LoadBalancerDiagram/CacheDiagram: фиксированный
// "холст" вместо измерения реальных DOM-координат — у нас всегда ровно
// три узла (Client/Proxy/Target).
const W = 640;
const H = 200;

const POS: Record<ProxyNodeId, { x: number; y: number }> = {
  client: { x: 80, y: 110 },
  proxy: { x: 320, y: 110 },
  target: { x: 560, y: 110 },
};

const BOX_W = 130;
const BOX_H = 56;

/** Сколько секунд пакет летит через ОДИН перегон — и для Demo.tsx тоже. */
export const PACKET_LEG_DURATION = 1.6;

function rectAt(center: { x: number; y: number }) {
  return { x: center.x - BOX_W / 2, y: center.y - BOX_H / 2 };
}

function buildPacketKeyframes(legs: [ProxyNodeId, ProxyNodeId][]) {
  const cx: number[] = [];
  const cy: number[] = [];
  for (const [from, to] of legs) {
    cx.push(POS[from].x, POS[to].x);
    cy.push(POS[from].y, POS[to].y);
  }
  const opacity = cx.map((_, i) => (i === 0 || i === cx.length - 1 ? 0 : 1));
  return { cx, cy, opacity };
}

export function ProxyDiagram({
  mode,
  step,
}: {
  mode: ProxyMode;
  step: ProxyStep;
}) {
  const packet = buildPacketKeyframes(step.legs);
  const touched = new Set(step.legs.flat());
  const eventKey = `${step.id}`;
  const targetLabel = PROXY_TARGET_LABEL[mode];

  // Барьер — граница доступа/сети. Forward: клиент+proxy "внутри", target
  // "снаружи" (барьер между proxy и target). Reverse: наоборот — клиент
  // снаружи, proxy+backend внутри (барьер между client и proxy).
  const barrierX =
    mode === "forward"
      ? (POS.proxy.x + BOX_W / 2 + POS.target.x - BOX_W / 2) / 2
      : (POS.client.x + BOX_W / 2 + POS.proxy.x - BOX_W / 2) / 2;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Схема проксирования"
      >
        <line
          x1={POS.client.x + BOX_W / 2}
          y1={POS.client.y}
          x2={POS.proxy.x - BOX_W / 2}
          y2={POS.proxy.y}
          stroke="rgb(51 65 85)"
          strokeWidth={2}
        />
        <line
          x1={POS.proxy.x + BOX_W / 2}
          y1={POS.proxy.y}
          x2={POS.target.x - BOX_W / 2}
          y2={POS.target.y}
          stroke="rgb(51 65 85)"
          strokeWidth={2}
        />

        {/* Барьер: граница, которую proxy пересекает "за" одну из сторон. */}
        <line
          x1={barrierX}
          y1={10}
          x2={barrierX}
          y2={H - 10}
          stroke="rgb(251 146 60)"
          strokeWidth={3}
          opacity={0.7}
        />

        <motion.circle
          key={`packet-${eventKey}`}
          r={7}
          fill="rgb(99 102 241)"
          initial={{ cx: packet.cx[0], cy: packet.cy[0], opacity: 0 }}
          animate={{ cx: packet.cx, cy: packet.cy, opacity: packet.opacity }}
          transition={{
            duration: PACKET_LEG_DURATION * step.legs.length,
            ease: "easeInOut",
          }}
        />

        <DiagramNode
          rect={rectAt(POS.client)}
          title="Client"
          tone={touched.has("client") ? "indigo" : "slate"}
          flashKey={touched.has("client") ? eventKey : "idle"}
        />
        <DiagramNode
          rect={rectAt(POS.proxy)}
          title={mode === "forward" ? "Forward Proxy" : "Reverse Proxy"}
          tone={touched.has("proxy") ? (step.cached ? "amber" : "indigo") : "slate"}
          flashKey={touched.has("proxy") ? eventKey : "idle"}
        />
        <DiagramNode
          rect={rectAt(POS.target)}
          title={targetLabel}
          tone={touched.has("target") ? "sky" : "slate"}
          flashKey={touched.has("target") ? eventKey : "idle"}
        />
      </svg>

      <p className="mt-1 text-center text-[11px] uppercase tracking-wider text-orange-400/80">
        {mode === "forward"
          ? "барьер: proxy — target (клиент выходит наружу только через proxy)"
          : "барьер: client — proxy (снаружи не видно, что за proxy)"}
      </p>
    </div>
  );
}

const TONE_FILL: Record<string, string> = {
  slate: "rgb(30 41 59)",
  indigo: "rgb(49 46 129)",
  sky: "rgb(12 74 110)",
  amber: "rgb(120 53 15)",
};
const TONE_STROKE: Record<string, string> = {
  slate: "rgb(71 85 105)",
  indigo: "rgb(129 140 248)",
  sky: "rgb(56 189 248)",
  amber: "rgb(251 191 36)",
};

function DiagramNode({
  rect,
  title,
  tone,
  flashKey,
}: {
  rect: { x: number; y: number };
  title: string;
  tone: keyof typeof TONE_FILL;
  flashKey: string;
}) {
  return (
    <g>
      <motion.rect
        key={flashKey}
        x={rect.x}
        y={rect.y}
        width={BOX_W}
        height={BOX_H}
        rx={10}
        fill={TONE_FILL[tone]}
        stroke={TONE_STROKE[tone]}
        strokeWidth={tone === "slate" ? 1.5 : 2.5}
        animate={tone !== "slate" ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        style={{
          transformOrigin: `${rect.x + BOX_W / 2}px ${rect.y + BOX_H / 2}px`,
        }}
        transition={{ duration: 0.4 }}
      />
      <text
        x={rect.x + BOX_W / 2}
        y={rect.y + BOX_H / 2 + 5}
        textAnchor="middle"
        fill="white"
        fontSize={14}
        fontWeight={600}
      >
        {title}
      </text>
    </g>
  );
}
