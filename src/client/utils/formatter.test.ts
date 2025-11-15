import { describe, expect, it } from 'vitest';

import { formatFileSize, generateFileId } from './formatters';

describe('formatters', () => {
    describe('formatFileSize', () => {
        it('should format 0 bytes correctly', () => {
            expect(formatFileSize(0)).toBe('0 Bytes');
        });

        it('should format bytes correctly', () => {
            expect(formatFileSize(500)).toBe('500 Bytes');
            expect(formatFileSize(1023)).toBe('1023 Bytes');
        });

        it('should format kilobytes correctly', () => {
            expect(formatFileSize(1024)).toBe('1 KB');
            expect(formatFileSize(1536)).toBe('1.5 KB');
            expect(formatFileSize(10240)).toBe('10 KB');
        });

        it('should format megabytes correctly', () => {
            expect(formatFileSize(1024 * 1024)).toBe('1 MB');
            expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
            expect(formatFileSize(1024 * 1024 * 100)).toBe('100 MB');
        });

        it('should format gigabytes correctly', () => {
            expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
            expect(formatFileSize(1024 * 1024 * 1024 * 5.2)).toBe('5.2 GB');
        });

        it('should respect decimal places parameter', () => {
            expect(formatFileSize(1536, 0)).toBe('2 KB');
            expect(formatFileSize(1536, 1)).toBe('1.5 KB');
            expect(formatFileSize(1536, 3)).toBe('1.5 KB');
        });
    });

    describe('generateFileId', () => {
        it('should generate a unique ID', () => {
            const id1 = generateFileId();
            const id2 = generateFileId();

            expect(id1).toBeTruthy();
            expect(id2).toBeTruthy();
            expect(id1).not.toBe(id2);
        });

        it('should generate IDs with timestamp and random suffix', () => {
            const id = generateFileId();
            const parts = id.split('-');

            expect(parts.length).toBe(2);
            expect(parts[0]).toMatch(/^\d+$/); // Timestamp
            expect(parts[1].length).toBeGreaterThan(0); // Random part
        });
    });
});