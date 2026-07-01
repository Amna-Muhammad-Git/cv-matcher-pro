export type MatchResult = {
  score: number; // 0..1
  matched_skills: string[];
  missing_skills: string[];
  jd_skills: string[];
  cv_skills: string[];
  rewritten_cv: string;
  original_cv: string;
  summary?: string;
};

const WEBHOOK_KEY = "cv-matcher.n8n.webhook";

export function getWebhookUrl(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(WEBHOOK_KEY) ?? "";
}

export function setWebhookUrl(url: string) {
  window.localStorage.setItem(WEBHOOK_KEY, url.trim());
}

function normalize(raw: unknown, originalCv: string): MatchResult {
  const r = (raw ?? {}) as Record<string, unknown>;
  const data = (r.data ?? r) as Record<string, unknown>;
  const jd = (data.jd_skills as string[]) ?? [];
  const matched = (data.matched_skills as string[]) ?? [];
  const missing =
    (data.missing_skills as string[]) ??
    jd.filter((s) => !matched.includes(s));
  const cvSkills = (data.cv_skills as string[]) ?? matched;
  const score =
    typeof data.score === "number"
      ? data.score > 1
        ? data.score / 100
        : data.score
      : jd.length
      ? matched.length / jd.length
      : 0;
  return {
    score,
    matched_skills: matched,
    missing_skills: missing,
    jd_skills: jd,
    cv_skills: cvSkills,
    rewritten_cv: (data.rewritten_cv as string) ?? originalCv,
    original_cv: originalCv,
    summary: data.summary as string | undefined,
  };
}

export async function runMatch(
  cvText: string,
  jdText: string,
  signal?: AbortSignal
): Promise<MatchResult> {
  const url = getWebhookUrl();
  if (!url) {
    throw new Error(
      "No n8n webhook URL configured. Open Settings to add one."
    );
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cv: cvText, jd: jdText }),
    signal,
  });
  if (!res.ok) {
    throw new Error(`n8n webhook failed: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("n8n returned non-JSON response");
  }
  return normalize(json, cvText);
}
