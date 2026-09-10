interface Props {
  percent: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
}

export function ProgressRing({ percent, size = 120, stroke = 12, label }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-zinc-200 dark:stroke-zinc-800" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className="fill-none stroke-indigo-500 transition-[stroke-dashoffset] duration-500"
          strokeDasharray={c}
          strokeDashoffset={c - (clamped / 100) * c}
        />
      </svg>
      <span className="absolute text-2xl font-bold tabular-nums">
        {label ?? `${Math.round(clamped)}%`}
      </span>
    </div>
  );
}
