import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const XANO = process.env.VITE_XANO_BASE_URL;
  if (!XANO) throw new Response("Missing VITE_XANO_BASE_URL", { status: 500 });

  const url = new URL(request.url);

  const page = url.searchParams.get("page") ?? "1";
  const perPage = url.searchParams.get("perPage") ?? "10";
  const q = url.searchParams.get("q") ?? "";

  const apiUrl = new URL(`${XANO}/jobs/public`);
  apiUrl.searchParams.set("page", page);
  apiUrl.searchParams.set("perPage", perPage);
  if (q) apiUrl.searchParams.set("q", q);

  const res = await fetch(apiUrl.toString());
  if (!res.ok) throw new Response("Failed to load jobs", { status: 500 });

  return await res.json();
}

export default function JobsIndex() {
  const data = useLoaderData<any>();

  return (
    <main style={{ padding: 24 }}>
      <h1>Jobs List Test</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
