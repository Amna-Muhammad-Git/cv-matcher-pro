import { ClipboardPaste } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function JdInput({ value, onChange }: Props) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="mono-label">02 · Job description</span>
        <button
          onClick={async () => {
            try {
              const t = await navigator.clipboard.readText();
              if (t) onChange(t);
            } catch {
              /* ignore */
            }
          }}
          className="mono-label flex items-center gap-1 hover:text-foreground"
        >
          <ClipboardPaste className="size-3" /> paste
        </button>
      </div>
      <div className="panel flex flex-1 flex-col overflow-hidden">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the full job description — responsibilities, required skills, nice-to-haves…"
          className="scrollbar-thin flex-1 resize-none bg-transparent p-4 font-sans text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <span className="mono-label">
            {value.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <span className="mono-label">{value.length.toLocaleString()} chars</span>
        </div>
      </div>
    </div>
  );
}
