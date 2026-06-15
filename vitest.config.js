import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      include: [
        'server/server.js',
        'src/components/**/*.{js,jsx}',
        'src/constants/orderStatus.js',
        'src/services/**/*.js',
      ],
      exclude: [
        'src/pages/PlaceholderPage.jsx',
      ],
    },
  },
});
