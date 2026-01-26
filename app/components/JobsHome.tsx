import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";

/* =========================
   Types
========================= */

type Venue = {
  id: number;
  name: string;
  full_address: string;
};

type Job = {
  id: number;
  created_at: number;
  name: string;
  slug: string;
  promoter?: string;
  hourly_rate?: string;
  public?: boolean;
  start?: number;
  end?: number;
  venues?: Venue[];
  description?: string;
  description_md?: string;
  company_slug?: string;
  position_slug?: string;
};

type JobsResponse = {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  perPage: number;
  totalItems?: number;
  items: Job[];
};

/* =========================
   Theme
========================= */

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }

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

/* =========================
   Helpers
========================= */

function stripMarkdown(text: string) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function makeSnippet(raw?: string, max = 180) {
  if (!raw) return "";
  const clean = stripMarkdown(raw);
  if (clean.length <= max) return clean;

  const sliced = clean.slice(0, max);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trim() + "…";
}

function formatDate(ts?: number) {
  if (!ts) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(ts));
  } catch {
    return null;
  }
}

function uniqueById(items: Job[]) {
  const map = new Map<number, Job>();
  for (const item of items) map.set(item.id, item);
  return Array.from(map.values());
}

/* =========================
   Component
========================= */

export function JobsHome() {
  const { jobs: initial } = useLoaderData<{ jobs: JobsResponse }>();
  const fetcher = useFetcher<JobsResponse>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const q = searchParams.get("q") ?? "";

  const [searchValue, setSearchValue] = useState(q);
  const [items, setItems] = useState<Job[]>(initial.items);
  const [nextPage, setNextPage] = useState<number | null>(initial.nextPage);

  /* =========================
     Colors & Styles
  ========================= */

  const colors = useMemo(() => {
    return {
      bg: isDark ? "#0b0f17" : "#f6f7fb",
      surface: isDark ? "#101827" : "#ffffff",
      surface2: isDark ? "#0f172a" : "#f3f4f6",
      border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      text: isDark ? "#e5e7eb" : "#0f172a",
      textMuted: isDark
        ? "rgba(229,231,235,0.72)"
        : "rgba(15,23,42,0.65)",
      brand: "#f3b130",
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
        padding: "44px 18px",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      },
      container: {
        maxWidth: 1100,
        margin: "0 auto",
      },
      header: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
        marginBottom: 18,
      },
      title: {
        margin: 0,
        fontSize: 30,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
      },
      subtitle: {
        marginTop: 8,
        color: colors.textMuted,
        fontSize: 14,
      },
      pill: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 999,
        background: colors.surface2,
        border: `1px solid ${colors.border}`,
        color: colors.textMuted,
        fontSize: 13,
      },
      themeToggle: {
        position: "fixed",
        left: 16,
        bottom: 16,
        width: 46,
        height: 46,
        borderRadius: 999,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        cursor: "pointer",
      },
      searchRow: {
        display: "flex",
        gap: 10,
        marginBottom: 18,
      },
      input: {
        flex: 1,
        padding: 12,
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        background: colors.surface,
      },
      button: {
        padding: "12px 14px",
        borderRadius: 14,
        background: colors.brand,
        color: colors.brandText,
        fontWeight: 800,
        border: "none",
        cursor: "pointer",
      },
      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 14,
      },
      card: {
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 18,
        padding: 16,
        textDecoration: "none",
        color: colors.text,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      },
      cardTitle: {
        margin: 0,
        fontSize: 18,
      },
      snippet: {
        color: colors.textMuted,
        fontSize: 14,
        lineHeight: 1.5,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
      },
      footerRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13,
        color: colors.textMuted,
      },
      small: {
        color: colors.textMuted,
        textAlign: "center",
        marginTop: 12,
      },
    };
  }, [colors]);

  /* =========================
     Effects
  ========================= */

  useEffect(() => {
    setSearchValue(q);
    setItems(initial.items);
    setNextPage(initial.nextPage);
  }, [q, initial.items, initial.nextPage]);

  useEffect(() => {
    if (!fetcher.data) return;
    setItems((prev) => uniqueById([...prev, ...fetcher.data.items]));
    setNextPage(fetcher.data.nextPage);
  }, [fetcher.data]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && nextPage && fetcher.state === "idle") {
          const sp = new URLSearchParams(searchParams);
          sp.set("page", String(nextPage));
          fetcher.load(`/?${sp.toString()}`);
        }
      },
      { rootMargin: "700px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [nextPage, fetcher.state, searchParams]);

  /* =========================
     Render
  ========================= */

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>SQRZ Jobs</h1>
            <div style={styles.subtitle}>
              Find gigs, tours, conferences and crew jobs — and get booked.
            </div>
          </div>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={styles.themeToggle}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </header>

        <section style={styles.grid}>
          {items.map((job) => {
            const snippet = makeSnippet(job.description, 200);
            const date = formatDate(job.start);

            return (
              <Link
                key={job.id}
                to={`/${job.company_slug}/${job.position_slug}`}
                style={styles.card}
              >
                <h2 style={styles.cardTitle}>{job.name}</h2>
                {snippet && <p style={styles.snippet}>{snippet}</p>}
                <div style={styles.footerRow}>
                  <span>{date}</span>
                  <span>#{job.id}</span>
                </div>
              </Link>
            );
          })}
        </section>

        <div ref={sentinelRef} style={{ height: 40 }} />

        {items.length === 0 && (
          <div style={styles.small}>No jobs found.</div>
        )}
      </div>
    </main>
  );
}
