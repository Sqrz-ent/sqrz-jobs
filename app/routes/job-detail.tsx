import {
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import type { LoaderFunctionArgs } from "@react-router/node";


type Job = {
  id: string;
  company_name: string;
  company_slug: string;
  position_title: string;
  position_slug: string;
  description?: string;

  hourly_rate?: string;        // e.g. "$80–120 / hr"
  skills?: string[];           // e.g. ["React", "Figma", "Webflow"]
  company_description?: string;
  apply_url?: string;          // external referral link
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

// Xano paginated list shape
const job: Job | undefined =
  Array.isArray(data)
    ? data[0]
    : Array.isArray(data.items)
      ? data.items[0]
      : undefined;

if (!job) {
  throw new Response("Not Found", { status: 404 });
}

return job;

    if (!job) {
      throw new Response("Not Found", { status: 404 });
    }

    return job;
  } catch (err) {
     if (err instanceof Response) {
    throw err;
  }

  throw new Response(
    err instanceof Error ? err.message : "Unknown server error",
    { status: 500 }
  );
}
}

export default function JobDetail() {
  const job = useLoaderData<Job>();

  return (
    <main
      style={{
        padding: "48px 24px",
        maxWidth: 960,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>
          {job.position_title}
        </h1>

        <p style={{ fontSize: 18, color: "#555" }}>
          {job.company_name}
        </p>

        {job.hourly_rate && (
          <p style={{ marginTop: 8, fontWeight: 500 }}>
            💰 {job.hourly_rate}
          </p>
        )}
      </header>

      {/* CTA */}
      {job.apply_url && (
        <div style={{ marginBottom: 40 }}>
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "14px 28px",
              background: "#000",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Apply →
          </a>
        </div>
      )}

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Skills</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {job.skills.map((skill) => (
              <span
                key={skill}
                style={{
                  padding: "6px 12px",
                  background: "#f1f1f1",
                  borderRadius: 999,
                  fontSize: 14,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Job description */}
      {job.description && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>
            About the role
          </h2>
          <div
            style={{ lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </section>
      )}

      {/* Company info */}
      {job.company_description && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>
            About {job.company_name}
          </h2>
          <p style={{ lineHeight: 1.6 }}>
            {job.company_description}
          </p>
        </section>
      )}

      {/* Bottom CTA */}
      {job.apply_url && (
        <footer style={{ marginTop: 64 }}>
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "16px 32px",
              background: "#000",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            Apply now →
          </a>
        </footer>
      )}
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


