import type { LoaderFunctionArgs, MetaFunction } from "@react-router/node";
import { useLoaderData } from "react-router";

import { JobsHome } from "~/components/JobsHome";
import { DashboardHome } from "~/components/DashboardHome";

export const meta: MetaFunction = () => [
  { title: "SQRZ" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const host = request.headers.get("host") ?? "";
  const isDashboard = host.startsWith("dashboard.");

  if (isDashboard) {
    return { mode: "dashboard" };
  }

  const XANO_BASE_URL = process.env.VITE_XANO_BASE_URL;
  if (!XANO_BASE_URL) {
    throw new Response("Missing VITE_XANO_BASE_URL", { status: 500 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const page = url.searchParams.get("page") ?? "1";
  const perPage = url.searchParams.get("perPage") ?? "12";

  const apiUrl = new URL(`${XANO_BASE_URL}/jobs/public`);
  apiUrl.searchParams.set("page", page);
  apiUrl.searchParams.set("perPage", perPage);
  if (q.trim()) apiUrl.searchParams.set("q", q.trim());

  const res = await fetch(apiUrl.toString());
  if (!res.ok) {
    throw new Response("Failed to load jobs", { status: 500 });
  }

  const jobs = await res.json();

  return {
    mode: "jobs",
    jobs,
  };
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  if (data.mode === "dashboard") {
    return <DashboardHome />;
  }

  return <JobsHome />;
}
