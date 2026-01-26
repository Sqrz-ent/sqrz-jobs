import type { LoaderFunctionArgs } from "@remix-run/node";

function clamp(str: string, max = 80) {
  const s = str.trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

function hashToHue(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const title = clamp(url.searchParams.get("title") || "New Job", 64);
  const company = clamp(url.searchParams.get("company") || "SQRZ", 48);
  const rate = clamp(url.searchParams.get("rate") || "", 28);
  const seed = url.searchParams.get("seed") || `${company}-${title}`;

  const hue = hashToHue(seed);

  // Simple SVG-based OG image (works everywhere)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 80%, 18%)"/>
      <stop offset="50%" stop-color="#0b0f17"/>
      <stop offset="100%" stop-color="hsl(${(hue + 35) % 360}, 80%, 18%)"/>
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="rgba(0,0,0,0.55)"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- subtle pattern -->
  <circle cx="160" cy="120" r="120" fill="rgba(243,177,48,0.14)"/>
  <circle cx="1080" cy="520" r="160" fill="rgba(243,177,48,0.10)"/>
  <circle cx="980" cy="120" r="90" fill="rgba(255,255,255,0.06)"/>

  <!-- main card -->
  <g filter="url(#shadow)">
    <rect x="70" y="80" width="1060" height="470" rx="32" fill="rgba(16,24,39,0.92)" stroke="rgba(255,255,255,0.10)" />
  </g>

  <!-- top badge -->
  <g>
    <rect x="120" y="130" width="210" height="44" rx="22" fill="rgba(243,177,48,0.18)" stroke="rgba(243,177,48,0.30)"/>
    <text x="225" y="160" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="18" fill="#F3B130">
      JOB OPENING
    </text>
  </g>

  <!-- Title -->
  <text x="120" y="250" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="64" font-weight="800" fill="#E5E7EB">
    ${escapeXml(title)}
  </text>

  <!-- Company -->
  <text x="120" y="315" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="30" font-weight="600" fill="rgba(229,231,235,0.75)">
    ${escapeXml(company)}
  </text>

  <!-- Rate badge (optional) -->
  ${
    rate
      ? `<g>
          <rect x="120" y="350" width="${Math.min(
            520,
            220 + rate.length * 14
          )}" height="46" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.10)"/>
          <text x="142" y="382" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="22" font-weight="650" fill="#E5E7EB">
            💰 ${escapeXml(rate)}
          </text>
        </g>`
      : ""
  }

  <!-- Footer -->
  <text x="120" y="510" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="22" fill="rgba(229,231,235,0.70)">
    SQRZ — The LinkInBio that gets you booked!
  </text>

  <!-- Small logo placeholder -->
  <g>
    <circle cx="1050" cy="160" r="26" fill="#F3B130"/>
    <text x="1050" y="168" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="20" font-weight="900" fill="#0b0f17">
      S
    </text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
