import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "@react-router/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const { company, position } = params;

  return {
    company,
    position,
  };
}

export default function JobDetail() {
  const data = useLoaderData<{
    company?: string;
    position?: string;
  }>();

  return (
    <main style={{ padding: 32 }}>
      <h1>Job detail</h1>
      <p>Company: {data.company}</p>
      <p>Position: {data.position}</p>
    </main>
  );
}
