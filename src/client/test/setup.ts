import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Ensure a basic clipboard stub exists in test environment (jsdom doesn't implement clipboard)
if (typeof navigator !== 'undefined' && !('clipboard' in navigator)) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (navigator as any).clipboard = {
        writeText: async (_text: string) => {},
        readText: async () => '',
    };
}