import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { extractTextFromFile } from "@/lib/parseFile";
import { cn } from "@/lib/utils";

type Props = {
  onExtracted: (text: string, filename: string) => void;
  filename: string | null;
  text: string;
  onClear: () => void;
};

export function CvUploader({ onExtracted, filename, text, onClear }: Props) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setErr(null);
      setBusy(true);
      try {
        const t = await extractTextFromFile(file);
        onExtracted(t, file.name);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to read file");
      } finally {
        setBusy(false);
      }
    },
    [onExtracted]
  );

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="mono-label">01 · Your CV</span>
        {filename && (
          <button
            onClick={onClear}
            className="mono-label flex items-center gap-1 hover:text-foreground"
          >
            <X className="size-3" /> clear
          </button>
        )}
      </div>

      {!filename ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) void handleFile(f);
          }}
          className={cn(
            "panel flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 border-dashed p-8 text-center transition-all",
            dragging &&
              "border-accent bg-[color:color-mix(in_oklab,var(--accent)_10%,transparent)]"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <div className="rounded-full border border-border bg-surface p-4">
            <Upload className="size-6 text-accent" />
          </div>
          <div>
            <p className="font-display text-lg">
              {busy ? "Extracting…" : "Drop your CV here"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              PDF, DOCX, TXT · parsed locally in your browser
            </p>
          </div>
          {err && (
            <p className="text-sm text-destructive">{err}</p>
          )}
        </label>
      ) : (
        <div className="panel flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <FileText className="size-4 text-accent" />
            <span className="font-mono text-sm">{filename}</span>
            <span className="mono-label ml-auto">
              {text.length.toLocaleString()} chars
            </span>
          </div>
          <pre className="scrollbar-thin flex-1 overflow-auto whitespace-pre-wrap p-4 font-sans text-sm leading-relaxed text-muted-foreground">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}
