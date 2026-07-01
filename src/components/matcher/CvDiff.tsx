import { useMemo, useState } from "react";
import { diffLines } from "diff";
import { cn } from "@/lib/utils";
import { Download, Copy, Check } from "lucide-react";
import { downloadCvPdf } from "@/lib/downloadPdf";

type Props = {
  original: string;
  rewritten: string;
};

export function CvDiff({ original, rewritten }: Props) {
  const [view, setView] = useState<"diff" | "rewritten">("diff");
  const [copied, setCopied] = useState(false);

  const parts = useMemo(() => diffLines(original, rewritten), [original, rewritten]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const p of parts) {
      const n = p.count ?? p.value.split("\n").length;
      if (p.added) added += n;
      else if (p.removed) removed += n;
    }
    return { added, removed };
  }, [parts]);

  return (
    <div className="panel flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <span className="mono-label">Rewritten CV</span>
        <div className="ml-2 flex gap-1 rounded-md border border-border p-0.5">
          <button
            onClick={() => setView("diff")}
            className={cn(
              "rounded px-3 py-1 font-mono text-xs",
              view === "diff"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            diff
          </button>
          <button
            onClick={() => setView("rewritten")}
            className={cn(
              "rounded px-3 py-1 font-mono text-xs",
              view === "rewritten"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            clean
          </button>
        </div>
        <span className="mono-label ml-auto text-accent">+{stats.added}</span>
        <span className="mono-label text-destructive">−{stats.removed}</span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(rewritten);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1 rounded-md border border-border px-3 py-1 font-mono text-xs hover:bg-surface"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "copied" : "copy"}
        </button>
        <button
          onClick={() => downloadCvPdf(rewritten)}
          className="flex items-center gap-1 rounded-md bg-accent px-3 py-1 font-mono text-xs font-medium text-accent-foreground hover:opacity-90"
        >
          <Download className="size-3" />
          PDF
        </button>
      </div>

      <div className="scrollbar-thin max-h-[520px] overflow-auto p-4 font-mono text-sm leading-relaxed">
        {view === "rewritten" ? (
          <pre className="whitespace-pre-wrap">{rewritten}</pre>
        ) : (
          <div className="whitespace-pre-wrap">
            {parts.map((p, i) => (
              <span
                key={i}
                className={cn(
                  p.added &&
                    "block bg-[color:color-mix(in_oklab,var(--accent)_18%,transparent)] px-1 text-accent",
                  p.removed &&
                    "block bg-[color:color-mix(in_oklab,var(--destructive)_18%,transparent)] px-1 text-destructive line-through opacity-80",
                  !p.added && !p.removed && "block text-muted-foreground"
                )}
              >
                {p.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
