import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': './',
    },
  },
  optimizeDeps: {
    exclude: ['@google/genai']
  },
  build: {
    rollupOptions: {
      external: ['@google/genai']
    }
  }
})
