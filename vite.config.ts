import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: "public/manifest.json", dest: "." },
        { src: "public/*.png", dest: "." },
        { src: "background.js", dest: "." },
        { src: "crx-hotreload.js", dest: "." },
      ],
    }),
  ],
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        format: "esm",
      },
    },
  },
  optimizeDeps: {
    include: ["@polkadot/util-crypto", "@polkadot/wasm-crypto"],
  },
});
