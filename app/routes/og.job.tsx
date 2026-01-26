import { ImageResponse } from "@vercel/og";
import type { LoaderFunctionArgs } from "@react-router/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "Job";
  const company = searchParams.get("company") || "Promoter";
  const rate = searchParams.get("rate") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "#0b0f17",
          color: "#e5e7eb",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "999px",
              background: "rgba(243,177,48,0.14)",
              border: "1px solid rgba(243,177,48,0.25)",
              color: "#f3b130",
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            SQRZ
          </div>

          <div style={{ fontSize: 20, opacity: 0.7 }}>jobs.sqrz.com</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05 }}>
            {title}
          </div>

          <div style={{ fontSize: 34, opacity: 0.85 }}>{company}</div>

          {rate ? (
            <div
              style={{
                marginTop: 10,
                fontSize: 26,
                padding: "10px 16px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                width: "fit-content",
              }}
            >
              💰 {rate}
            </div>
          ) : null}
        </div>

        <div style={{ fontSize: 24, opacity: 0.7 }}>
          The LinkInBio that gets you booked!
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
