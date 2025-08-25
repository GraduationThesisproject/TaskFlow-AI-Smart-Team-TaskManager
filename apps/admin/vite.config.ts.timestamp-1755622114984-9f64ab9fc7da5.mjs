// vite.config.ts
import { defineConfig } from "file:///C:/Users/Sekri/OneDrive/Desktop/work/SENIOR/TaskFlow-AI-Smart-Team-TaskManager/apps/admin/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Sekri/OneDrive/Desktop/work/SENIOR/TaskFlow-AI-Smart-Team-TaskManager/apps/admin/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Sekri\\OneDrive\\Desktop\\work\\SENIOR\\TaskFlow-AI-Smart-Team-TaskManager\\apps\\admin";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@taskflow/ui": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src"),
      "@taskflow/theme": path.resolve(__vite_injected_original_dirname, "../../packages/theme"),
      "@taskflow/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils/src")
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxTZWtyaVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXHdvcmtcXFxcU0VOSU9SXFxcXFRhc2tGbG93LUFJLVNtYXJ0LVRlYW0tVGFza01hbmFnZXJcXFxcYXBwc1xcXFxhZG1pblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcU2VrcmlcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFx3b3JrXFxcXFNFTklPUlxcXFxUYXNrRmxvdy1BSS1TbWFydC1UZWFtLVRhc2tNYW5hZ2VyXFxcXGFwcHNcXFxcYWRtaW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1Nla3JpL09uZURyaXZlL0Rlc2t0b3Avd29yay9TRU5JT1IvVGFza0Zsb3ctQUktU21hcnQtVGVhbS1UYXNrTWFuYWdlci9hcHBzL2FkbWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0B0YXNrZmxvdy91aSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy91aS9zcmMnKSxcclxuICAgICAgJ0B0YXNrZmxvdy90aGVtZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy90aGVtZScpLFxyXG4gICAgICAnQHRhc2tmbG93L3V0aWxzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3V0aWxzL3NyYycpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaWQsU0FBUyxvQkFBb0I7QUFDOWUsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsZ0JBQWdCLEtBQUssUUFBUSxrQ0FBVyx1QkFBdUI7QUFBQSxNQUMvRCxtQkFBbUIsS0FBSyxRQUFRLGtDQUFXLHNCQUFzQjtBQUFBLE1BQ2pFLG1CQUFtQixLQUFLLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsSUFDdkU7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
