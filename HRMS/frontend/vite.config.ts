import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@controls': path.resolve(__dirname, './src/common-controls'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
      },
      '/swagger': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
      },
    },
  },
});
