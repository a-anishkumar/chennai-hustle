import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/@react-three/rapier')) return 'rapier';
          if (id.includes('node_modules/@react-three')) return 'r3f';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
