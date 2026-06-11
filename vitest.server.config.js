import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'server/**/*.test.js',
      'tests/server/**/*.test.js',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache}/**',
      'tests/components/**',
      'tests/pages/**',
    ],
  },
});
