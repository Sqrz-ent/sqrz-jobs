export default [
  index("routes/home.tsx"),
  route(":company/:position", "routes/job-detail.tsx"),
] satisfies RouteConfig;
