import type { LoaderFunctionArgs, MetaFunction } from "@react-router/node";
import { useLoaderData } from "react-router";
import type { MetaFunction } from "@react-router/node";



import { JobsHome } from "~/components/JobsHome";


export const meta: MetaFunction = () => {
  const title = "SQRZ - The Link-In-Bio that gets you booked!";
  const description =
    "Browse freelance crew jobs, touring gigs, conferences and event work. Get booked with SQRZ.";

  const ogImage = "/sqrz-logo-630.png";

  return [
    { title },
    { name: "description", content: description },

    // OpenGraph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:image", content: ogImage },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];
};


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

  return <JobsHome />;
}
