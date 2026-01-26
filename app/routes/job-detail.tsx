import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "@react-router/node";

type Job = {
  id: string;
  company_name: string;
  company_slug: string;
  position_title: string;
  position_slug: string;
  description?: string;
};

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
  url.searchParams.set("position_slug", position);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Response("Not Found", { status: 404 });
  }

  const data = await res.json();
  const job: Job | undefined = Array.isArray(data) ? data[0] : data;

  if (!job) {
    throw new Response("Not Found", { status: 404 });
  }

  return job;
}

export default function JobDetail() {
  const job = useLoaderData<Job>();

  return (
    <main style={{ padding: 32, maxWidth: 800 }}>
      <h1>{job.position_title}</h1>
      <p>
        <strong>{job.company_name}</strong>
      </p>

      {job.description && (
        <div
          style={{ marginTop: 24 }}
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      )}
    </main>
  );
}
