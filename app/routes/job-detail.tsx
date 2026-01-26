import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "@react-router/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const { company, position } = params;

  const XANO_BASE_URL = import.meta.env.VITE_XANO_BASE_URL;

  return {
    company,
    position,
    hasEnv: Boolean(XANO_BASE_URL),
    baseUrl: XANO_BASE_URL ? "env-loaded" : "missing",
  };
}

export default function JobDetail() {
  const data = useLoaderData<{
    company?: string;
    position?: string;
    hasEnv: boolean;
    baseUrl: string;
  }>();

  return (
    <main style={{ padding: 32 }}>
      <h1>Job detail</h1>
      <p>Company: {data.company}</p>
      <p>Position: {data.position}</p>
      <p>Env present: {String(data.hasEnv)}</p>
    </main>
  );
}
