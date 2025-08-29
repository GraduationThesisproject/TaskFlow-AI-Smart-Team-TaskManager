import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@taskflow/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@taskflow/theme': path.resolve(__dirname, '../../packages/theme'),
      '@taskflow/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
  server: {
    port: 5175,
    strictPort: false, // Allow Vite to find an available port
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
