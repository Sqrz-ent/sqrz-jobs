import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "@react-router/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const { company, position } = params;

  if (!company || !position) {
    throw new Response("Not Found", { status: 404 });
  }

  const XANO_BASE_URL = import.meta.env.VITE_XANO_BASE_URL;
  if (!XANO_BASE_URL) {
    throw new Error("Missing VITE_XANO_BASE_URL");
  }

  const url = new URL(`${XANO_BASE_URL}/jobs`);
  url.searchParams.set("company_slug", company);
  url.searchParams.set("slug", position);

  const res = await fetch(url.toString());

  return {
    ok: res.ok,
    status: res.status,
  };
}

export default function JobDetail() {
  const data = useLoaderData<{
    ok: boolean;
    status: number;
  }>();

  return (
    <main style={{ padding: 32 }}>
      <h1>Job detail</h1>
      <p>Fetch OK: {String(data.ok)}</p>
      <p>Status: {data.status}</p>
    </main>
  );
}
