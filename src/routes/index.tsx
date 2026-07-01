import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { CvUploader } from "@/components/matcher/CvUploader";
import { JdInput } from "@/components/matcher/JdInput";
import { ProgressStepper, type Step } from "@/components/matcher/ProgressStepper";
import { ScoreBadge } from "@/components/matcher/ScoreBadge";
import { SkillPanel } from "@/components/matcher/SkillPanel";
import { CvDiff } from "@/components/matcher/CvDiff";
import { SettingsDialog } from "@/components/matcher/SettingsDialog";
import { AuthButton } from "@/components/matcher/AuthButton";

import { runMatch, type MatchResult, getWebhookUrl } from "@/lib/n8n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CV Matcher · tailor your CV to any job" },
      {
        name: "description",
        content:
          "Upload your CV, paste a job description, and get a match score, skill-gap analysis, and a rewritten CV — powered by n8n.",
      },
      { property: "og:title", content: "CV Matcher" },
      {
        property: "og:description",
        content:
          "Match score, skill gaps, and a tailored CV rewrite — driven by your n8n workflow.",
      },
    ],
  }),
  component: Index,
});

const STEP_DEFS: Omit<Step, "status">[] = [
  { id: "parse", label: "Reading your CV" },
  { id: "extract", label: "Extracting your skills" },
  { id: "match", label: "Matching to the job" },
  { id: "rewrite", label: "Rewriting your CV" },
];

function Index() {
  const [cvText, setCvText] = useState("");
  const [cvFilename, setCvFilename] = useState<string | null>(null);
  const [jdText, setJdText] = useState("");
  const [steps, setSteps] = useState<Step[]>(
    STEP_DEFS.map((s) => ({ ...s, status: "pending" }))
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasWebhook, setHasWebhook] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setHasWebhook(!!getWebhookUrl());
    const i = setInterval(() => setHasWebhook(!!getWebhookUrl()), 1000);
    return () => clearInterval(i);
  }, []);

  const setStep = (idx: number, status: Step["status"]) =>
    setSteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, status } : s))
    );

  const resetSteps = () =>
    setSteps(STEP_DEFS.map((s) => ({ ...s, status: "pending" })));

  const run = useCallback(async () => {
    if (!cvText.trim() || !jdText.trim() || running) return;
    setError(null);
    setResult(null);
    resetSteps();
    setRunning(true);

    // Optimistic staged progress — n8n returns a single response,
    // so we animate through the pipeline steps while awaiting it.
    setStep(0, "done"); // CV already parsed locally
    setStep(1, "active");
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => {
        setStep(1, "done");
        setStep(2, "active");
      }, 900),
      setTimeout(() => {
        setStep(2, "done");
        setStep(3, "active");
      }, 2200),
    ];

    try {
      const res = await runMatch(cvText, jdText);
      timers.current.forEach(clearTimeout);
      setSteps(STEP_DEFS.map((s) => ({ ...s, status: "done" })));
      setResult(res);
    } catch (e) {
      timers.current.forEach(clearTimeout);
      setError(e instanceof Error ? e.message : "Something went wrong");
      resetSteps();
    } finally {
      setRunning(false);
    }
  }, [cvText, jdText, running]);

  const startOver = () => {
    setResult(null);
    setError(null);
    resetSteps();
  };

  const canRun = cvText.trim() && jdText.trim() && hasWebhook && !running;

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h1 className="font-display text-lg leading-none">cv/match</h1>
            <p className="mono-label mt-1">tailor · score · rewrite</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AuthButton />
          <SettingsDialog />
        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24">
        {!result ? (
          <>
            <section className="mb-8">
              <h2 className="max-w-3xl font-display text-4xl leading-tight md:text-5xl">
                Rewrite your CV for{" "}
                <span className="text-accent">this exact role</span> — in under
                a minute.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Drop your CV, paste the job description. Your n8n pipeline
                extracts skills, scores the match, flags gaps, and returns a
                clean rewrite.
              </p>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="min-h-[420px]">
                <CvUploader
                  filename={cvFilename}
                  text={cvText}
                  onExtracted={(t, f) => {
                    setCvText(t);
                    setCvFilename(f);
                  }}
                  onClear={() => {
                    setCvText("");
                    setCvFilename(null);
                  }}
                />
              </div>
              <div className="min-h-[420px]">
                <JdInput value={jdText} onChange={setJdText} />
              </div>
            </section>

            <section className="mt-8 flex flex-col items-center gap-4">
              {!hasWebhook && (
                <p className="mono-label text-warning">
                  ⚠ set your n8n webhook in settings to run the match
                </p>
              )}
              {error && (
                <p className="rounded-md border border-destructive/40 bg-[color:color-mix(in_oklab,var(--destructive)_15%,transparent)] px-4 py-2 font-mono text-sm text-destructive">
                  {error}
                </p>
              )}
              <button
                onClick={run}
                disabled={!canRun}
                className="group flex items-center gap-3 rounded-lg bg-accent px-8 py-4 font-display text-lg font-medium text-accent-foreground shadow-glow transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                {running ? "Matching…" : "Run match"}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </button>

              {running && (
                <div className="panel mt-4 w-full max-w-md p-6">
                  <ProgressStepper steps={steps} />
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="mono-label">Result</span>
                <h2 className="font-display text-3xl">
                  {cvFilename ?? "Your CV"} <span className="text-muted-foreground">×</span>{" "}
                  <span className="text-accent">the role</span>
                </h2>
              </div>
              <button
                onClick={startOver}
                className="flex items-center gap-2 rounded-md border border-border px-4 py-2 font-mono text-sm hover:bg-surface"
              >
                <RotateCcw className="size-3.5" /> new match
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto,1fr]">
              <ScoreBadge score={result.score} />
              <div className="flex flex-col gap-4">
                {result.summary && (
                  <div className="panel p-5 text-sm leading-relaxed text-foreground/90">
                    {result.summary}
                  </div>
                )}
                <SkillPanel
                  matched={result.matched_skills}
                  missing={result.missing_skills}
                />
              </div>
            </div>

            <CvDiff original={result.original_cv} rewritten={result.rewritten_cv} />
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-8">
        <p className="mono-label">runs on n8n · parsed locally · nothing stored</p>
      </footer>
    </div>
  );
}
