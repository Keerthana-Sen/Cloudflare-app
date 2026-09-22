import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import agents from "agents/vite";

export default defineConfig({
  plugins: [agents(), react(), cloudflare()],
});