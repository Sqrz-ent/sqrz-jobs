import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

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

  const url = new URL("https://xuwq-ib46-ag3b.f2.xano.io/api:215ig9EX/jobs");
  url.searchParams.set("company_slug", company);
  url.searchParams.set("slug", position);

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Response("Not Found", { status: 404 });
  }

  const data = await res.json();

  // Xano usually returns an array for filtered lists
  const job = Array.isArray(data) ? data[0] : data;

  if (!job) {
    throw new Response("Not Found", { status: 404 });
  }

  return job;
}

export default function JobDetail() {
  const job = useLoaderData<Job>();

  return (
    <main style={{ padding: 32 }}>
      <h1>{job.position_title}</h1>
      <p>{job.company_name}</p>

      {job.description && (
        <div
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      )}
    </main>
  );
}
