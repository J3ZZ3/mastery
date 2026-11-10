import { useId } from "react";

const TONE = {
  mint: "#128f81",
  amber: "#b45309",
  sky: "#0284c7",
  neutral: "#64748b",
};

export default function NumberLine({ config }) {
  const markerId = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (!config) return null;

  const width = 760;
  const padding = 44;
  const axisY = 102;
  const min = Number(config.min);
  const max = Number(config.max);
  const step = Number(config.step) || 1;
  const span = max - min || 1;
  const xFor = (value) => padding + ((value - min) / span) * (width - padding * 2);
  const ticks = [];
  for (let value = min; value <= max + 0.0001; value += step) {
    ticks.push(Number(value.toFixed(4)));
  }

  const markers = config.markers || [];
  const arrows = config.arrows || [];
  const description = [
    config.title,
    ...markers.map((marker) => `${marker.label} at ${marker.value}`),
    ...arrows.map((arrow) => `move ${arrow.label} from ${arrow.from} to ${arrow.to}`),
  ].join(". ");

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
      <p className="mb-2 px-1 text-xs font-semibold text-slate-700">{config.title}</p>
      <svg
        viewBox={`0 0 ${width} 180`}
        className="h-auto w-full"
        role="img"
        aria-label={description}
      >
        <title>{description}</title>
        <defs>
          {Object.entries(TONE).map(([tone, color]) => (
            <marker
              key={tone}
              id={`${markerId}-${tone}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
            </marker>
          ))}
        </defs>

        <line x1={padding} y1={axisY} x2={width - padding} y2={axisY} stroke="#94a3b8" strokeWidth="2" />

        {ticks.map((value) => {
          const x = xFor(value);
          const isZero = value === 0;
          return (
            <g key={value}>
              <line
                x1={x}
                y1={axisY - (isZero ? 9 : 6)}
                x2={x}
                y2={axisY + (isZero ? 9 : 6)}
                stroke={isZero ? "#334155" : "#cbd5e1"}
                strokeWidth={isZero ? 2 : 1}
              />
              <text
                x={x}
                y={axisY + 24}
                textAnchor="middle"
                fontSize="10"
                fill={isZero ? "#0f172a" : "#64748b"}
                fontWeight={isZero ? "700" : "500"}
              >
                {value}
              </text>
            </g>
          );
        })}

        {markers.map((marker, index) => {
          const x = xFor(Number(marker.value));
          const color = TONE[marker.tone] || TONE.neutral;
          return (
            <g key={`${marker.value}-${index}`}>
              <circle cx={x} cy={axisY} r="6" fill={color} stroke="#ffffff" strokeWidth="2" />
              <text x={x} y={axisY - 16} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
                {marker.label}
              </text>
            </g>
          );
        })}

        {arrows.map((arrow, index) => {
          const from = xFor(Number(arrow.from));
          const to = xFor(Number(arrow.to));
          const color = TONE[arrow.tone] || TONE.sky;
          const mid = (from + to) / 2;
          return (
            <g key={`${arrow.from}-${arrow.to}-${index}`}>
              <line
                x1={from}
                y1={axisY + 48}
                x2={to}
                y2={axisY + 48}
                stroke={color}
                strokeWidth="2"
                markerEnd={`url(#${markerId}-${arrow.tone || "sky"})`}
              />
              <text x={mid} y={axisY + 68} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
                {arrow.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
