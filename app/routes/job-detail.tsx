import { useEffect, useMemo, useState } from "react";
import {
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import type { LoaderFunctionArgs } from "@react-router/node";
import type { MetaFunction, LinksFunction } from "@remix-run/node";

type Job = {
  id: string;
  company_name: string;
  company_slug: string;
  position_title: string;
  position_slug: string;
  description?: string;

  hourly_rate?: string;
  skills?: {
    id: number;
    task: string;
  }[];
  company_description?: string;
  apply_url?: string;
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { company, position } = params;

  if (!company || !position) {
    throw new Response("Not Found", { status: 404 });
  }

  const XANO_BASE_URL = import.meta.env.VITE_XANO_BASE_URL;
  if (!XANO_BASE_URL) {
    throw new Response("Missing VITE_XANO_BASE_URL", { status: 500 });
  }

  try {
    const url = new URL(`${XANO_BASE_URL}/jobs`);
    url.searchParams.set("company_slug", company);
    url.searchParams.set("position_slug", position);

    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Response("Not Found", { status: 404 });
    }

    const data = await res.json();

    const job: Job | undefined = Array.isArray(data)
      ? data[0]
      : Array.isArray(data.items)
        ? data.items[0]
        : undefined;

    if (!job) {
      throw new Response("Not Found", { status: 404 });
    }

    return job;
  } catch (err) {
    if (err instanceof Response) throw err;

    throw new Response(
      err instanceof Error ? err.message : "Unknown server error",
      { status: 500 }
    );
  }
}
export const links: LinksFunction = () => {
  return [
    { rel: "icon", href: "/sqrz-favicon.png", type: "image/png" },
    { rel: "apple-touch-icon", href: "/sqrz-apple-touch.png" },
  ];
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "Job not found | SQRZ" },
      {
        name: "description",
        content: "SQRZ – The LinkInBio that gets you booked!",
      },
    ];
  }

  const job = data as Job;

  const title = `${job.position_title} at ${job.company_name} | SQRZ`;

  // 1-line job description for SEO + previews
  const shortDesc = job.hourly_rate
    ? `${job.company_name} is hiring: ${job.position_title} (${job.hourly_rate}).`
    : `${job.company_name} is hiring: ${job.position_title}.`;

  // non-visible branding text
  const tagline = "SQRZ – The LinkInBio that gets you booked!";

  // Preview image strategy (fast version for now):
  // You can replace this later with a true dynamic OG generator.
  const ogImage = "/og/og-1.png";

  return [
    { title },
    { name: "description", content: shortDesc },

    // non-visible SQRZ tagline
    { name: "application-name", content: "SQRZ" },
    { name: "generator", content: tagline },

    // OpenGraph
    { property: "og:title", content: title },
    { property: "og:description", content: `${shortDesc} — ${tagline}` },
    { property: "og:type", content: "article" },
    { property: "og:image", content: ogImage },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: `${shortDesc} — ${tagline}` },
    { name: "twitter:image", content: ogImage },
  ];
};
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }

    // default to system
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}


function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatJobDescriptionToHtml(raw: string) {
  const text = raw.trim();

  // 1) Normalize spacing
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // 2) Headings we want to detect
  const headings = [
    "You are a good fit if you:",
    "About the role",
    "Application process",
    "Pay and legal status",
  ];

  // 3) Insert newlines before headings so we can split
  let withBreaks = normalized;
  for (const h of headings) {
    const re = new RegExp(`\\s*${h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "g");
    withBreaks = withBreaks.replace(re, `\n\n${h}\n`);
  }

  // 4) Split into blocks by double newlines
  const blocks = withBreaks
    .split(/\n\s*\n/g)
    .map((b) => b.trim())
    .filter(Boolean);

  // 5) Convert blocks into HTML
  const htmlParts: string[] = [];

  for (const block of blocks) {
    const isHeading = headings.includes(block);

    if (isHeading) {
      htmlParts.push(`<h3>${escapeHtml(block.replace(/:$/, ""))}</h3>`);
      continue;
    }

    // Detect bullet-ish blocks: many short phrases separated by periods
    // OR block contains multiple "Strong / Comfort / Familiarity / Background" patterns
    const bulletish =
      /Strong |Comfort |Familiarity |Background |Generalist |You must |This role |We will /i.test(block) &&
      block.length > 120;

    if (bulletish) {
      // Split into bullet sentences (simple heuristic)
      const items = block
        .split(/(?<=[.])\s+(?=[A-Z])/g)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // If we got enough items, render as list
      if (items.length >= 3) {
        htmlParts.push(
          `<ul>${items
            .map((i) => `<li>${escapeHtml(i.replace(/\.$/, ""))}</li>`)
            .join("")}</ul>`
        );
        continue;
      }
    }

    // Default paragraph
    htmlParts.push(`<p>${escapeHtml(block)}</p>`);
  }

  return htmlParts.join("\n");
}


export default function JobDetail() {
  const job = useLoaderData<Job>();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const colors = useMemo(() => {
    return {
      bg: isDark ? "#0b0f17" : "#f6f7fb",
      surface: isDark ? "#101827" : "#ffffff",
      surface2: isDark ? "#0f172a" : "#f3f4f6",
      border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      text: isDark ? "#e5e7eb" : "#0f172a",
      textMuted: isDark ? "rgba(229,231,235,0.72)" : "rgba(15,23,42,0.65)",
      brand: "#f3b130", // your main color
      brandText: "#0b0f17",
      shadow: isDark
        ? "0 18px 60px rgba(0,0,0,0.55)"
        : "0 18px 60px rgba(15,23,42,0.12)",
      link: isDark ? "#93c5fd" : "#2563eb",
    };
  }, [isDark]);

  const styles = useMemo(() => {
    return {
      page: {
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        padding: "48px 20px",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      } as const,

      container: {
        maxWidth: 960,
        margin: "0 auto",
      } as const,

      topBar: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 18,
      } as const,

      badgeRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
      } as const,

      badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        background: colors.surface2,
        border: `1px solid ${colors.border}`,
        color: colors.textMuted,
        fontSize: 13,
        lineHeight: 1,
      } as const,

      card: {
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 18,
        boxShadow: colors.shadow,
        overflow: "hidden",
      } as const,

      cardInner: {
        padding: 28,
      } as const,

      title: {
        fontSize: 34,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        margin: 0,
      } as const,

      company: {
        marginTop: 10,
        fontSize: 16,
        color: colors.textMuted,
      } as const,

      divider: {
        height: 1,
        background: colors.border,
        margin: "22px 0",
      } as const,

      sectionTitle: {
        fontSize: 15,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: colors.textMuted,
        marginBottom: 12,
      } as const,

      richText: {
        lineHeight: 1.7,
        fontSize: 16,
        color: colors.text,
      } as const,

      skillsWrap: {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
      } as const,

      skillPill: {
        padding: "8px 12px",
        background: isDark ? "rgba(243,177,48,0.12)" : "#fff7e6",
        border: `1px solid ${isDark ? "rgba(243,177,48,0.25)" : "#fde68a"}`,
        borderRadius: 999,
        fontSize: 13,
        color: colors.text,
      } as const,

      ctaRow: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginTop: 18,
      } as const,

      primaryBtn: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "14px 18px",
        borderRadius: 14,
        background: colors.brand,
        color: colors.brandText,
        textDecoration: "none",
        fontWeight: 700,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
        cursor: "pointer",
      } as const,

      secondaryBtn: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "14px 18px",
        borderRadius: 14,
        background: "transparent",
        color: colors.text,
        textDecoration: "none",
        fontWeight: 650,
        border: `1px solid ${colors.border}`,
        cursor: "pointer",
      } as const,

      bottomMeta: {
        marginTop: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        color: colors.textMuted,
        fontSize: 13,
      } as const,

      themeToggle: {
        position: "fixed",
        left: 16,
        bottom: 16,
        zIndex: 50,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 46,
        height: 46,
        borderRadius: 999,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        boxShadow: isDark
          ? "0 10px 28px rgba(0,0,0,0.55)"
          : "0 10px 28px rgba(15,23,42,0.18)",
        cursor: "pointer",
        userSelect: "none",
      } as const,

      themeToggleIcon: {
        fontSize: 18,
      } as const,
    };
  }, [colors, isDark]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    } catch {
      // fallback
      prompt("Copy this link:", window.location.href);
    }
  };

  return (
    <main style={styles.page}>
      {/* Dark mode toggle (bottom-left) */}
      <button
        type="button"
        aria-label="Toggle dark mode"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        style={styles.themeToggle}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span style={styles.themeToggleIcon}>{isDark ? "☀️" : "🌙"}</span>
      </button>

      <div style={styles.container}>
        <div style={styles.topBar}>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>💼 Job</span>
            {job.hourly_rate && <span style={styles.badge}>💰 {job.hourly_rate}</span>}
            <span style={styles.badge}>🏢 {job.company_name}</span>
          </div>
        </div>

        <article style={styles.card}>
          <div style={styles.cardInner}>
            {/* Header */}
            <header>
              <h1 style={styles.title}>{job.position_title}</h1>
              <div style={styles.company}>
                {job.company_name}{" "}
                <span style={{ color: colors.textMuted }}>
                  • {job.company_slug}/{job.position_slug}
                </span>
              </div>

              {/* CTA */}
              <div style={styles.ctaRow}>
                {job.apply_url ? (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.primaryBtn}
                  >
                    Apply now <span aria-hidden>→</span>
                  </a>
                ) : (
                  <span style={styles.badge}>No application link provided</span>
                )}

                <button type="button" onClick={handleCopyLink} style={styles.secondaryBtn}>
                  Copy link
                </button>
              </div>
            </header>

            <div style={styles.divider} />

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <section style={{ marginBottom: 24 }}>
                <div style={styles.sectionTitle}>Skills</div>
                <div style={styles.skillsWrap}>
                  {job.skills.map((skill) => (
                    <span key={skill.id} style={styles.skillPill}>
                      {skill.task}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Job description */}
            {job.description && (
  <section style={{ marginBottom: 26 }}>
    <div style={styles.sectionTitle}>About the role</div>
    <div
      style={styles.richText}
      dangerouslySetInnerHTML={{
        __html: formatJobDescriptionToHtml(job.description),
      }}
    />
  </section>
)}


            {/* Company info */}
            {job.company_description && (
              <section style={{ marginBottom: 10 }}>
                <div style={styles.sectionTitle}>About {job.company_name}</div>
                <p style={{ margin: 0, ...styles.richText, color: colors.textMuted }}>
                  {job.company_description}
                </p>
              </section>
            )}

            <div style={styles.bottomMeta}>
              <span>Built with SQRZ ⚡</span>
              <span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
                <a
                  href="/"
                  style={{
                    color: colors.link,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Back
                </a>
                {job.apply_url && (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: colors.link,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Open apply link →
                  </a>
                )}
              </span>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <main style={{ padding: 32 }}>
          <h1>Job not found</h1>
          <p>This position may have been removed or renamed.</p>
        </main>
      );
    }
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Something went wrong</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {error instanceof Error ? error.message : JSON.stringify(error)}
      </pre>
    </main>
  );
}
