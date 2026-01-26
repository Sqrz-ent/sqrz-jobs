import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // ✅ put this BEFORE the dynamic route
  route("og/job", "routes/og.job.tsx"),

  // dynamic job route must come last
  route(":company/:position", "routes/job-detail.tsx"),
] satisfies RouteConfig;
