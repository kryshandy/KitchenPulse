import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,                          // ← ajouter cette ligne
    proxy: {
      '/api': {
        target: 'http://10.247.191.245:3001',  // ← changer ici
        changeOrigin: true,
      },
    },
  },
});