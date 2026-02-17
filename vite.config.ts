import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Charting library
          'recharts': ['recharts'],
          // Animation library
          'framer-motion': ['framer-motion'],
          // Analytics & data processing
          'analytics': [
            'papaparse',
            'sentiment',
          ],
        },
      },
    },
  },
})
