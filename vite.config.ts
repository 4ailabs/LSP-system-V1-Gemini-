import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    exclude: ['better-sqlite3', 'drizzle-orm', 'drizzle-kit'],
  },
  build: {
    rollupOptions: {
      external: ['better-sqlite3', 'drizzle-orm', 'drizzle-kit'],
    },
  },
});
