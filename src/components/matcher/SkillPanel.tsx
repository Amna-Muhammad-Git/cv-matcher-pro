import { Check, AlertTriangle } from "lucide-react";

type Props = {
  matched: string[];
  missing: string[];
};

export function SkillPanel({ matched, missing }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="panel p-5">
        <div className="mb-3 flex items-center gap-2">
          <Check className="size-4 text-accent" />
          <span className="mono-label">Matched · {matched.length}</span>
        </div>
        {matched.length === 0 ? (
          <p className="text-sm text-muted-foreground">No overlap detected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {matched.map((s) => (
              <span
                key={s}
                className="rounded-md border border-accent/40 bg-[color:color-mix(in_oklab,var(--accent)_15%,transparent)] px-2 py-1 font-mono text-xs text-accent"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="panel p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="size-4 text-warning" />
          <span className="mono-label">Skill gap · {missing.length}</span>
        </div>
        {missing.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing missing — you're fully covered.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {missing.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-warning/40 bg-[color:color-mix(in_oklab,var(--warning)_12%,transparent)] px-2 py-1 font-mono text-xs text-warning"
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              These aren't added to your CV — just flagged so you know what the
              role wants that yours doesn't show.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
