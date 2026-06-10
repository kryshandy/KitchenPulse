import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,          // ✅ accessible depuis toutes les machines du réseau
    proxy: {
      '/api': {
        target: 'http://10.247.191.245:3001',  // ✅ IP du serveur backend
        changeOrigin: true,
      },
      // ✅ FIX IMAGES : proxy les uploads aussi vers le serveur backend
      '/uploads': {
        target: 'http://10.247.191.245:3001',
        changeOrigin: true,
      },
    },
  },
});
