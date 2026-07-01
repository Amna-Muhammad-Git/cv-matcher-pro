import { useEffect, useState } from "react";
import { Settings, X } from "lucide-react";
import { getWebhookUrl, setWebhookUrl } from "@/lib/n8n";

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (open) setUrl(getWebhookUrl());
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 font-mono text-xs hover:bg-surface"
      >
        <Settings className="size-3.5" />
        n8n webhook
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="panel w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg">n8n webhook</h3>
              <button onClick={() => setOpen(false)}>
                <X className="size-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Paste your n8n <span className="font-mono">Webhook</span> URL. The
              app POSTs <code className="font-mono text-accent">{"{ cv, jd }"}</code> and
              expects JSON with{" "}
              <code className="font-mono text-accent">
                matched_skills, missing_skills, jd_skills, rewritten_cv
              </code>
              .
            </p>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-n8n.example.com/webhook/…"
              className="w-full rounded-md border border-border bg-input px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-2 font-mono text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setWebhookUrl(url);
                  setOpen(false);
                }}
                className="rounded-md bg-accent px-4 py-2 font-mono text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
