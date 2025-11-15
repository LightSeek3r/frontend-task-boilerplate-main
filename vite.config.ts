import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        // use jsdom so DOM globals like `document` and `window` are available to tests
        environment: 'jsdom',
        env: {
            NODE_ENV: 'test',
        },
        globals: true,
        setupFiles: ['./src/client/test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            exclude: ['node_modules/', 'src/test/', '**/*.test.ts', '**/*.test.tsx'],
        },
    },
});