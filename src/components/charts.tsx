export type BarDatum = { label: string; value: number; display?: string; note?: string };

const fmt = (n: number) => n.toLocaleString("en-NG");

/* Horizontal bars: funnel, accuracy and similar. */
export function HBarChart({
  data,
  max,
  barClass = "bg-navy-900 dark:bg-gold-500",
  empty = "No data yet.",
}: {
  data: BarDatum[];
  max?: number;
  barClass?: string;
  empty?: string;
}) {
  if (data.length === 0) return <p className="text-sm text-neutral-500 dark:text-white/60">{empty}</p>;
  const top = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3">
      {data.map((d) => {
        const pct = d.value > 0 ? Math.max(1.5, Math.min(100, (d.value / top) * 100)) : 0;
        const shown = d.display ?? fmt(d.value);
        return (
          <li key={d.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">{d.label}</span>
              <span className="shrink-0 font-bold">{shown}</span>
            </div>
            <div className="mt-1 h-2.5 rounded-full bg-navy-100 dark:bg-white/10" role="img" aria-label={`${d.label}: ${shown}`}>
              <div className={`h-2.5 rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
            </div>
            {d.note ? <p className="mt-0.5 text-xs text-neutral-500 dark:text-white/60">{d.note}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

/* Vertical bars: a few comparable numbers side by side. */
export function ColumnChart({ data, height = 190 }: { data: { label: string; value: number }[]; height?: number }) {
  const W = 360;
  const H = height;
  const padT = 24;
  const padB = 28;
  const max = Math.max(...data.map((d) => d.value), 1);
  const slot = W / Math.max(data.length, 1);
  const bw = Math.min(64, slot * 0.6);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={data.map((d) => `${d.label}: ${fmt(d.value)}`).join(", ")}
    >
      <line x1="0" x2={W} y1={H - padB} y2={H - padB} strokeWidth="1" className="stroke-neutral-300 dark:stroke-white/20" />
      {data.map((d, i) => {
        const h = ((H - padB - padT) * d.value) / max;
        const x = i * slot + (slot - bw) / 2;
        const y = H - padB - h;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={bw} height={d.value > 0 ? Math.max(h, 2) : 0} rx="4" className="fill-navy-900 dark:fill-gold-500" />
            <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize="12" fontWeight="700" className="fill-navy-900 dark:fill-white">
              {fmt(d.value)}
            </text>
            <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="12" className="fill-neutral-600 dark:fill-white/70">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Pie / donut. Pass Tailwind classes for the colours so dark mode stays in your hands. */
export type Slice = { label: string; value: number; stroke: string; swatch: string };

export function Donut({ slices, centerValue, centerLabel }: { slices: Slice[]; centerValue: string; centerLabel: string }) {
  const total = slices.reduce((n, s) => n + s.value, 0);
  const r = 54;
  const c = 2 * Math.PI * r;

  const arcs: { s: Slice; len: number; start: number }[] = [];
  let acc = 0;
  for (const s of slices) {
    const len = total > 0 ? (s.value / total) * c : 0;
    arcs.push({ s, len, start: acc });
    acc += len;
  }

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg
          viewBox="0 0 140 140"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={slices.map((s) => `${s.label}: ${fmt(s.value)}`).join(", ")}
        >
          <circle cx="70" cy="70" r={r} fill="none" strokeWidth="18" className="stroke-navy-100 dark:stroke-white/10" />
          {arcs
            .filter((a) => a.len > 0)
            .map((a) => (
              <circle
                key={a.s.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                strokeWidth="18"
                strokeDasharray={`${a.len} ${c - a.len}`}
                strokeDashoffset={-a.start}
                className={a.s.stroke}
              />
            ))}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <span className="text-2xl font-black text-navy-900 dark:text-white">{centerValue}</span>
          <span className="text-xs text-neutral-500 dark:text-white/60">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-1 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span aria-hidden className={`h-3 w-3 rounded-full ${s.swatch}`} />
            {s.label}: <strong>{fmt(s.value)}</strong>
            <span className="text-xs text-neutral-500 dark:text-white/60">
              {total > 0 ? `${Math.round((s.value / total) * 100)}%` : "0%"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}