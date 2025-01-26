import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [vue()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
