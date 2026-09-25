/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    environment: 'node',
    restoreMocks: true,
    globals: true,
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'istanbul',
      include: ['src/**'],
      exclude: ['src/components/ui/**'],
    },
  },
});
