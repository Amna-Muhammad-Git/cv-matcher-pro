import { Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "pending" | "active" | "done";
export type Step = { id: string; label: string; status: StepStatus };

export function ProgressStepper({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-full border transition-colors",
              s.status === "done" &&
                "border-accent bg-accent text-accent-foreground",
              s.status === "active" &&
                "border-accent bg-transparent text-accent",
              s.status === "pending" && "border-border text-muted-foreground"
            )}
          >
            {s.status === "done" ? (
              <Check className="size-4" />
            ) : s.status === "active" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Circle className="size-2 fill-current" />
            )}
          </div>
          <span
            className={cn(
              "font-mono text-sm",
              s.status === "pending" && "text-muted-foreground",
              s.status === "active" && "text-foreground",
              s.status === "done" && "text-foreground/80"
            )}
          >
            <span className="mono-label mr-2">{String(i + 1).padStart(2, "0")}</span>
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
