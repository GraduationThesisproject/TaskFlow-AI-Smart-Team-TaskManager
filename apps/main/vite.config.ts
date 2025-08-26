import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@taskflow/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@taskflow/theme': path.resolve(__dirname, '../../packages/theme'),
      '@taskflow/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
});
