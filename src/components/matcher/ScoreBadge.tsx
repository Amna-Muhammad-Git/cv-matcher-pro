import { useEffect, useState } from "react";

export function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * pct));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - display / 100);

  const tone =
    pct >= 75 ? "text-accent" : pct >= 50 ? "text-warning" : "text-destructive";

  return (
    <div className="panel flex flex-col items-center gap-3 p-6">
      <span className="mono-label">Match score</span>
      <div className="relative size-32">
        <svg viewBox="0 0 128 128" className="size-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className={tone}
            style={{ transition: "stroke-dashoffset 60ms linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-4xl font-bold ${tone}`}>
            {display}
          </span>
          <span className="mono-label mt-1">/ 100</span>
        </div>
      </div>
    </div>
  );
}
