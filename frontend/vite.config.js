import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Toutes les requêtes /api proxiées vers le backend (inclut /api/auth)
      '/api': {
        target:       'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});