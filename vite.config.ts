import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],

  // needed for @vercel/og (wasm + fonts)
  assetsInclude: ["**/*.wasm", "**/*.ttf"],

  // bundle @vercel/og into the server build (fixes Vercel build crash)
  ssr: {
    noExternal: ["@vercel/og"],
  },
});

"@remix-run/dev": "^2.x"
