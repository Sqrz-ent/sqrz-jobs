import { useEffect, useMemo, useState } from "react";
import { Link, useFetcher, useLoaderData, useSearchParams } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";



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

export const meta: MetaFunction = () => {
  return [
    { title: "Jobs • SQRZ" },
    {
      name: "description",
      content: "Browse gigs, jobs and crew positions on SQRZ.",
    },
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



function stripMarkdown(text: string) {
  return text
    // remove markdown links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    // remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // remove headings/bullets markers
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    // remove emphasis markers
    .replace(/[*_~]+/g, "")
    // normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function makeSnippet(raw?: string, max = 180) {
  if (!raw) return "";
  const clean = stripMarkdown(raw);

  if (clean.length <= max) return clean;

  // cut at a nice boundary
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

export async function loader({ request }: LoaderFunctionArgs) {
  const XANO_BASE_URL = process.env.VITE_XANO_BASE_URL;
  if (!XANO_BASE_URL) throw new Response("Missing VITE_XANO_BASE_URL", { status: 500 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const page = url.searchParams.get("page") ?? "1";
  const perPage = url.searchParams.get("perPage") ?? "12";

  const apiUrl = new URL(`${XANO_BASE_URL}/jobs/public`);
  apiUrl.searchParams.set("page", page);
  apiUrl.searchParams.set("perPage", perPage);
  if (q.trim()) apiUrl.searchParams.set("q", q.trim());

  const res = await fetch(apiUrl.toString());
  if (!res.ok) throw new Response("Failed to load jobs", { status: 500 });

  const data = (await res.json()) as JobsResponse;
  return data;
}

export default function JobsIndex() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const initial = useLoaderData<JobsResponse>();
  const fetcher = useFetcher<JobsResponse>();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";

  // local UI state
  const [searchValue, setSearchValue] = useState(q);

  // list state (appends pages)
  const [items, setItems] = useState<Job[]>(initial.items);
  const [nextPage, setNextPage] = useState<number | null>(initial.nextPage);

  // When the URL changes (new search), reset list
  useEffect(() => {
    setSearchValue(q);
    setItems(initial.items);
    setNextPage(initial.nextPage);
  }, [q, initial.items, initial.nextPage]);

  // When fetcher returns data, append it
  useEffect(() => {
    if (!fetcher.data) return;

    setItems((prev) => uniqueById([...prev, ...(fetcher.data?.items ?? [])]));
    setNextPage(fetcher.data.nextPage ?? null);
  }, [fetcher.data]);

  const isLoadingMore = fetcher.state !== "idle";
  const sentinelRef = useRef<HTMLDivElement | null>(null);

const colors = useMemo(() => {
  return {
    bg: isDark ? "#0b0f17" : "#f6f7fb",
    surface: isDark ? "#101827" : "#ffffff",
    surface2: isDark ? "#0f172a" : "#f3f4f6",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text: isDark ? "#e5e7eb" : "#0f172a",
    textMuted: isDark ? "rgba(229,231,235,0.72)" : "rgba(15,23,42,0.65)",
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
      } as const,

      container: {
        maxWidth: 1100,
        margin: "0 auto",
      } as const,

      header: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
        marginBottom: 18,
      } as const,

      title: {
        margin: 0,
        fontSize: 30,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
      } as const,

      subtitle: {
        marginTop: 8,
        color: colors.textMuted,
        fontSize: 14,
      } as const,

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
        lineHeight: 1,
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



      searchRow: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        marginBottom: 18,
      } as const,

      input: {
        flex: 1,
        padding: "12px 12px",
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        background: colors.surface,
        outline: "none",
        fontSize: 14,
      } as const,

      button: {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        background: colors.brand,
        color: colors.brandText,
        fontWeight: 800,
        cursor: "pointer",
      } as const,

      ghostButton: {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        background: "transparent",
        color: colors.text,
        fontWeight: 700,
        cursor: "pointer",
      } as const,

      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 14,
      } as const,


      
      card: {
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 18,
        boxShadow: colors.shadow,
        padding: 16,
        textDecoration: "none",
        color: colors.text,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      } as const,

      cardTitle: {
        margin: 0,
        fontSize: 18,
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
      } as const,

      metaRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        color: colors.textMuted,
        fontSize: 13,
      } as const,

      snippet: {
  margin: 0,
  marginTop: 2,
  color: colors.textMuted,
  fontSize: 14,
  lineHeight: 1.5,

  // clamp to 3 lines (nice for cards)
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
} as const,



      footerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        marginTop: 6,
        color: colors.textMuted,
        fontSize: 13,
      } as const,

      paginationRow: {
        display: "flex",
        justifyContent: "center",
        marginTop: 18,
      } as const,

      small: {
        color: colors.textMuted,
        fontSize: 13,
        marginTop: 10,
        textAlign: "center",
      } as const,
    };
  }, [colors]);

  const applySearch = () => {
    const sp = new URLSearchParams(searchParams);

    // reset to page 1 when searching
    sp.set("page", "1");
    sp.set("perPage", sp.get("perPage") ?? "12");

    if (searchValue.trim()) sp.set("q", searchValue.trim());
    else sp.delete("q");

    setSearchParams(sp, { replace: true });
  };

  const clearSearch = () => {
    const sp = new URLSearchParams(searchParams);
    sp.delete("q");
    sp.set("page", "1");
    setSearchParams(sp, { replace: true });
  };

  const loadMore = () => {
    if (!nextPage) return;
    if (isLoadingMore) return;

    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(nextPage));
    sp.set("perPage", sp.get("perPage") ?? "12");

    fetcher.load(`/?${sp.toString()}`);
  };

useEffect(() => {
  const el = sentinelRef.current;
  if (!el) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const first = entries[0];
      if (!first?.isIntersecting) return;

      // only load if there is a next page and we are not already loading
      if (nextPage && fetcher.state === "idle") {
        loadMore();
      }
    },
    {
      rootMargin: "700px", // preload earlier for smoothness
    }
  );

  observer.observe(el);
  return () => observer.disconnect();
}, [nextPage, fetcher.state]); // loadMore uses nextPage internally


  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>SQRZ Jobs</h1>
            <div style={styles.subtitle}>
              Find gigs, tours, conferences and crew jobs — and get booked.
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={styles.pill}>💼 {initial.totalItems ?? initial.itemsReceived} jobs</span>
              <span style={styles.pill}>📄 Page {initial.curPage}</span>
              {q && <span style={styles.pill}>🔎 “{q}”</span>}
            </div>
          </div>

          <button
          type="button"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(isDark ? "light" : "dark")}
         style={styles.themeToggle}
         title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
         <span style={styles.themeToggleIcon}>{isDark ? "☀️" : "🌙"}</span>
        </button>



          <a
            href="https://sqrz.com"
            style={{ color: colors.link, fontWeight: 800, textDecoration: "none" }}
          >
            sqrz.com →
          </a>
        </header>

        <div style={styles.searchRow}>
          <input
            style={styles.input}
            placeholder="Search (promoter, event name...)"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
          />

          <button type="button" style={styles.button} onClick={applySearch}>
            Search
          </button>

          {q && (
            <button type="button" style={styles.ghostButton} onClick={clearSearch}>
              Clear
            </button>
          )}
        </div>

        <section style={styles.grid}>
          {items.map((job) => {
            const date = formatDate(job.start);
            const venue = job.venues?.[0]?.name || job.venues?.[0]?.full_address;
            const snippet = makeSnippet(job.description, 200);
            <div ref={sentinelRef} style={{ height: 1 }} />


            return (
              <Link
              key={job.id}
              to={`/${job.company_slug}/${job.position_slug}`}
              style={styles.card}
>
                <h2 style={styles.cardTitle}>{job.name || "Untitled job"}</h2>

                <div style={styles.metaRow}>
                  <span style={styles.pill}>🧑‍💼 {job.promoter || "Unknown promoter"}</span>
                  {job.hourly_rate && <span style={styles.pill}>💰 {job.hourly_rate}</span>}
                  {date && <span style={styles.pill}>📅 {date}</span>}
                  {venue && <span style={styles.pill}>📍 {venue}</span>}
                </div>

              {snippet && <p style={styles.snippet}>{snippet}</p>}


                <div style={styles.footerRow}>
                  <span>Open job →</span>
                  <span>#{job.id}</span>
                </div>
              </Link>
            );
          })}
        </section>

        {items.length === 0 && <div style={styles.small}>No jobs found.</div>}

        <div style={styles.paginationRow}>
          {nextPage ? (
            <button type="button" style={styles.button} onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? "Loading…" : "Load more"}
            </button>
          ) : (
            <div style={styles.small}>That’s everything 🎉</div>
          )}
        </div>
      </div>
    </main>
  );
}
