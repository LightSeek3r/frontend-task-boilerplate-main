import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StandardUpload } from './StandardUpload';

describe('StandardUpload', () => {
    let standardUpload: StandardUpload;

    beforeEach(() => {
        standardUpload = new StandardUpload('/api/test-upload');
    });

    it('should create an instance with default endpoint', () => {
        const upload = new StandardUpload();
        expect(upload).toBeInstanceOf(StandardUpload);
    });

    it('should create an instance with custom endpoint', () => {
        expect(standardUpload).toBeInstanceOf(StandardUpload);
    });

    it('should call onProgress during upload', async () => {
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const onProgress = vi.fn();
        const onSuccess = vi.fn();
        const onError = vi.fn();

        // Mock XMLHttpRequest
        const mockXHR = {
            upload: {
                addEventListener: vi.fn((event, handler) => {
                    if (event === 'progress') {
                        // Simulate progress event
                        setTimeout(() => {
                            handler({ lengthComputable: true, loaded: 50, total: 100 });
                        }, 10);
                    }
                }),
            },
            addEventListener: vi.fn((event, handler) => {
                if (event === 'load') {
                    setTimeout(() => {
                        mockXHR.status = 200;
                        mockXHR.responseText = JSON.stringify({ message: 'Success' });
                        handler();
                    }, 20);
                }
            }),
            open: vi.fn(),
            send: vi.fn(),
            status: 0,
            responseText: '',
        };

        global.XMLHttpRequest = vi.fn(() => mockXHR) as any;

        await standardUpload.upload(file, { onProgress, onSuccess, onError });

        // Wait for async operations
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(onProgress).toHaveBeenCalled();
    });

    it('should call onSuccess when upload completes successfully', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const onProgress = vi.fn();
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const mockXHR = {
            upload: { addEventListener: vi.fn() },
            addEventListener: vi.fn((event, handler) => {
                if (event === 'load') {
                    setTimeout(() => {
                        mockXHR.status = 200;
                        mockXHR.responseText = JSON.stringify({
                            message: 'Success',
                            fileId: 'test-id',
                        });
                        handler();
                    }, 10);
                }
            }),
            open: vi.fn(),
            send: vi.fn(),
            status: 0,
            responseText: '',
        };

        global.XMLHttpRequest = vi.fn(() => mockXHR) as any;

        await standardUpload.upload(file, { onProgress, onSuccess, onError });

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(onSuccess).toHaveBeenCalledWith('test-id');
        expect(onError).not.toHaveBeenCalled();
    });

    it('should call onError when upload fails', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const onProgress = vi.fn();
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const mockXHR = {
            upload: { addEventListener: vi.fn() },
            addEventListener: vi.fn((event, handler) => {
                if (event === 'load') {
                    setTimeout(() => {
                        mockXHR.status = 500;
                        handler();
                    }, 10);
                }
            }),
            open: vi.fn(),
            send: vi.fn(),
            status: 0,
            responseText: '',
        };

        global.XMLHttpRequest = vi.fn(() => mockXHR) as any;

        await standardUpload.upload(file, { onProgress, onSuccess, onError });

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(onError).toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});