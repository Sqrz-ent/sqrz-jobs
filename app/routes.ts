import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route(":company/:position", "routes/job-detail.tsx"),
  route("og/job", "routes/og.job.tsx"),
] satisfies RouteConfig;
