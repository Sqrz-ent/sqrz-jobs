import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route(":slug", "routes/job-detail.tsx"),
] satisfies RouteConfig;
