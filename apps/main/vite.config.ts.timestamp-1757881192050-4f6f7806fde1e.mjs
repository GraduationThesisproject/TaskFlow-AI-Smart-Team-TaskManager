// vite.config.ts
import { defineConfig } from "file:///C:/Users/Hzdou/OneDrive/Desktop/projet%20basseem/TaskFlow-AI-Smart-Team-TaskManager/apps/main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Hzdou/OneDrive/Desktop/projet%20basseem/TaskFlow-AI-Smart-Team-TaskManager/apps/main/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Hzdou\\OneDrive\\Desktop\\projet basseem\\TaskFlow-AI-Smart-Team-TaskManager\\apps\\main";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@taskflow/ui": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src"),
      "@taskflow/theme": path.resolve(__vite_injected_original_dirname, "../../packages/theme"),
      "@taskflow/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils/src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIemRvdVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXHByb2pldCBiYXNzZWVtXFxcXFRhc2tGbG93LUFJLVNtYXJ0LVRlYW0tVGFza01hbmFnZXJcXFxcYXBwc1xcXFxtYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIemRvdVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXHByb2pldCBiYXNzZWVtXFxcXFRhc2tGbG93LUFJLVNtYXJ0LVRlYW0tVGFza01hbmFnZXJcXFxcYXBwc1xcXFxtYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9IemRvdS9PbmVEcml2ZS9EZXNrdG9wL3Byb2pldCUyMGJhc3NlZW0vVGFza0Zsb3ctQUktU21hcnQtVGVhbS1UYXNrTWFuYWdlci9hcHBzL21haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAdGFza2Zsb3cvdWknOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvdWkvc3JjJyksXG4gICAgICAnQHRhc2tmbG93L3RoZW1lJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3RoZW1lJyksXG4gICAgICAnQHRhc2tmbG93L3V0aWxzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3V0aWxzL3NyYycpLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdWQsU0FBUyxvQkFBb0I7QUFDcGYsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLGdCQUFnQixLQUFLLFFBQVEsa0NBQVcsdUJBQXVCO0FBQUEsTUFDL0QsbUJBQW1CLEtBQUssUUFBUSxrQ0FBVyxzQkFBc0I7QUFBQSxNQUNqRSxtQkFBbUIsS0FBSyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLElBQ3ZFO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
