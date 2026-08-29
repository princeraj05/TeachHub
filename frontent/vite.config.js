import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('node_modules/recharts')) {
              return 'recharts';
            }
            if (id.includes('node_modules/firebase')) {
              return 'firebase';
            }
            if (id.includes('node_modules/jspdf')) {
              return 'jspdf';
            }
            if (id.includes('node_modules/react-icons') || id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
          }
        }
      }
    }
  }
})
