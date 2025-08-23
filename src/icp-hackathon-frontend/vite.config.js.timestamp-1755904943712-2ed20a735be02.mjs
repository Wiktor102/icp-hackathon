// vite.config.js
import { fileURLToPath, URL } from "url";
import react from "file:///mnt/i/Respozytoria%20GitHub/icp-hackathon/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig } from "file:///mnt/i/Respozytoria%20GitHub/icp-hackathon/node_modules/vite/dist/node/index.js";
import environment from "file:///mnt/i/Respozytoria%20GitHub/icp-hackathon/node_modules/vite-plugin-environment/dist/index.js";
import dotenv from "file:///mnt/i/Respozytoria%20GitHub/icp-hackathon/node_modules/dotenv/lib/main.js";
var __vite_injected_original_import_meta_url = "file:///mnt/i/Respozytoria%20GitHub/icp-hackathon/src/icp-hackathon-frontend/vite.config.js";
dotenv.config({ path: "../../.env" });
var vite_config_default = defineConfig({
  build: {
    emptyOutDir: true
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true
      }
    }
  },
  plugins: [react(), environment("all", { prefix: "CANISTER_" }), environment("all", { prefix: "DFX_" })],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", __vite_injected_original_import_meta_url))
      }
    ],
    dedupe: ["@dfinity/agent"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2kvUmVzcG96eXRvcmlhIEdpdEh1Yi9pY3AtaGFja2F0aG9uL3NyYy9pY3AtaGFja2F0aG9uLWZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvbW50L2kvUmVzcG96eXRvcmlhIEdpdEh1Yi9pY3AtaGFja2F0aG9uL3NyYy9pY3AtaGFja2F0aG9uLWZyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9tbnQvaS9SZXNwb3p5dG9yaWElMjBHaXRIdWIvaWNwLWhhY2thdGhvbi9zcmMvaWNwLWhhY2thdGhvbi1mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gXCJ1cmxcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgZW52aXJvbm1lbnQgZnJvbSBcInZpdGUtcGx1Z2luLWVudmlyb25tZW50XCI7XHJcbmltcG9ydCBkb3RlbnYgZnJvbSBcImRvdGVudlwiO1xyXG5cclxuZG90ZW52LmNvbmZpZyh7IHBhdGg6IFwiLi4vLi4vLmVudlwiIH0pO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuXHRidWlsZDoge1xyXG5cdFx0ZW1wdHlPdXREaXI6IHRydWVcclxuXHR9LFxyXG5cdG9wdGltaXplRGVwczoge1xyXG5cdFx0ZXNidWlsZE9wdGlvbnM6IHtcclxuXHRcdFx0ZGVmaW5lOiB7XHJcblx0XHRcdFx0Z2xvYmFsOiBcImdsb2JhbFRoaXNcIlxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHRzZXJ2ZXI6IHtcclxuXHRcdHByb3h5OiB7XHJcblx0XHRcdFwiL2FwaVwiOiB7XHJcblx0XHRcdFx0dGFyZ2V0OiBcImh0dHA6Ly8xMjcuMC4wLjE6NDk0M1wiLFxyXG5cdFx0XHRcdGNoYW5nZU9yaWdpbjogdHJ1ZVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHRwbHVnaW5zOiBbcmVhY3QoKSwgZW52aXJvbm1lbnQoXCJhbGxcIiwgeyBwcmVmaXg6IFwiQ0FOSVNURVJfXCIgfSksIGVudmlyb25tZW50KFwiYWxsXCIsIHsgcHJlZml4OiBcIkRGWF9cIiB9KV0sXHJcblx0cmVzb2x2ZToge1xyXG5cdFx0YWxpYXM6IFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGZpbmQ6IFwiZGVjbGFyYXRpb25zXCIsXHJcblx0XHRcdFx0cmVwbGFjZW1lbnQ6IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi4uL2RlY2xhcmF0aW9uc1wiLCBpbXBvcnQubWV0YS51cmwpKVxyXG5cdFx0XHR9XHJcblx0XHRdLFxyXG5cdFx0ZGVkdXBlOiBbXCJAZGZpbml0eS9hZ2VudFwiXVxyXG5cdH1cclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlgsU0FBUyxlQUFlLFdBQVc7QUFDaGEsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sWUFBWTtBQUoyTixJQUFNLDJDQUEyQztBQU0vUixPQUFPLE9BQU8sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVwQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixPQUFPO0FBQUEsSUFDTixhQUFhO0FBQUEsRUFDZDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ2IsZ0JBQWdCO0FBQUEsTUFDZixRQUFRO0FBQUEsUUFDUCxRQUFRO0FBQUEsTUFDVDtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTixRQUFRO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDZjtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksT0FBTyxFQUFFLFFBQVEsWUFBWSxDQUFDLEdBQUcsWUFBWSxPQUFPLEVBQUUsUUFBUSxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQ3RHLFNBQVM7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNOO0FBQUEsUUFDQyxNQUFNO0FBQUEsUUFDTixhQUFhLGNBQWMsSUFBSSxJQUFJLG1CQUFtQix3Q0FBZSxDQUFDO0FBQUEsTUFDdkU7QUFBQSxJQUNEO0FBQUEsSUFDQSxRQUFRLENBQUMsZ0JBQWdCO0FBQUEsRUFDMUI7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
