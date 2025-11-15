import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { UploadStrategy } from '../../services/UploadStrategy';
import type { UploadCallbacks } from '../../services/types';
import { FileList } from './FileList';
import { FileUploader } from './FileUploader';
import { UploadProvider } from './UploadContext';

/**
 * Mock upload strategy for testing
 */
class MockUploadStrategy implements UploadStrategy {
    constructor(private shouldFail: boolean = false) {}

    async upload(file: File, callbacks: UploadCallbacks): Promise<void> {
        // Simulate progress
        callbacks.onProgress(25);
        await new Promise((resolve) => setTimeout(resolve, 10));

        callbacks.onProgress(50);
        await new Promise((resolve) => setTimeout(resolve, 10));

        callbacks.onProgress(75);
        await new Promise((resolve) => setTimeout(resolve, 10));

        if (this.shouldFail) {
            callbacks.onError(new Error('Upload failed'));
        } else {
            callbacks.onProgress(100);
            callbacks.onSuccess(file.name);
        }
    }
}

describe('Upload Integration', () => {
    it('should upload a file successfully end-to-end', async () => {
        const user = userEvent.setup();
        const mockStrategy = new MockUploadStrategy();

        render(
            <UploadProvider uploadStrategy={mockStrategy}>
                <FileUploader />
                <FileList />
            </UploadProvider>
        );

        // Initially no files
        expect(screen.queryByRole('list')).not.toBeInTheDocument();

        // Select a file
        const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/file input/i) as HTMLInputElement;

        await user.upload(input, file);

        // File should appear in the list
        await waitFor(() => {
            expect(screen.getByText('test-file.txt')).toBeInTheDocument();
        });

        // Should show uploading status icon (global check)
        expect(screen.getByLabelText(/uploading/i)).toBeInTheDocument();

        // Wait for upload to complete and scope the 'Completed' text to the specific file's list item
        await waitFor(
            () => {
                const listItem = screen.getByText('test-file.txt').closest('li');
                expect(listItem).toBeTruthy();
                expect(within(listItem as HTMLElement).getByLabelText(/upload successful/i)).toBeInTheDocument();
                expect(within(listItem as HTMLElement).getByText(/completed/i)).toBeInTheDocument();
            },
            { timeout: 2000 }
        );
    });

    it('should handle upload failures gracefully', async () => {
        const user = userEvent.setup();
        const mockStrategy = new MockUploadStrategy(true); // shouldFail = true

        render(
            <UploadProvider uploadStrategy={mockStrategy}>
                <FileUploader />
                <FileList />
            </UploadProvider>
        );

        const file = new File(['test'], 'fail-test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/file input/i) as HTMLInputElement;

        await user.upload(input, file);

        // Wait for failure and scope the 'Upload failed' text to the specific file's list item
        await waitFor(
            () => {
                const listItem = screen.getByText('fail-test.txt').closest('li');
                expect(listItem).toBeTruthy();
                expect(within(listItem as HTMLElement).getByLabelText(/upload failed/i)).toBeInTheDocument();
                // there are multiple occurrences of the text "Upload failed" in the item (summary and alert)
                // assert specifically that the alert is present and contains the expected message
                expect(within(listItem as HTMLElement).getByRole('alert')).toHaveTextContent(/upload failed/i);
            },
            { timeout: 2000 }
        );
    });

    it('should handle multiple files', async () => {
        const user = userEvent.setup();
        const mockStrategy = new MockUploadStrategy();

        render(
            <UploadProvider uploadStrategy={mockStrategy}>
                <FileUploader multiple />
                <FileList />
            </UploadProvider>
        );

        const file1 = new File(['content 1'], 'file1.txt', { type: 'text/plain' });
        const file2 = new File(['content 2'], 'file2.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/file input/i) as HTMLInputElement;

        await user.upload(input, [file1, file2]);

        // Both files should appear
        await waitFor(() => {
            expect(screen.getByText('file1.txt')).toBeInTheDocument();
            expect(screen.getByText('file2.txt')).toBeInTheDocument();
        });

        // Should show file count
        expect(screen.getByText(/files \(2\)/i)).toBeInTheDocument();
    });

    it('should allow removing files', async () => {
        const user = userEvent.setup();
        const mockStrategy = new MockUploadStrategy();

        render(
            <UploadProvider uploadStrategy={mockStrategy}>
                <FileUploader />
                <FileList />
            </UploadProvider>
        );

        const file = new File(['content'], 'remove-test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/file input/i) as HTMLInputElement;

        await user.upload(input, file);

        await waitFor(() => {
            expect(screen.getByText('remove-test.txt')).toBeInTheDocument();
        });

        // Click remove button
        const removeButton = screen.getByRole('button', { name: /remove remove-test.txt/i });
        await user.click(removeButton);

        // File should be removed
        await waitFor(() => {
            expect(screen.queryByText('remove-test.txt')).not.toBeInTheDocument();
        });
    });

    it('should clear completed files', async () => {
        const user = userEvent.setup();
        const mockStrategy = new MockUploadStrategy();

        render(
            <UploadProvider uploadStrategy={mockStrategy}>
                <FileUploader />
                <FileList />
            </UploadProvider>
        );

        const file = new File(['content'], 'clear-test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/file input/i) as HTMLInputElement;

        await user.upload(input, file);

        // Wait for completion
        await waitFor(
            () => {
                expect(screen.getByLabelText(/upload successful/i)).toBeInTheDocument();
            },
            { timeout: 2000 }
        );

        // Clear completed
        const clearButton = screen.getByRole('button', { name: /clear completed/i });
        await user.click(clearButton);

        // File should be removed
        await waitFor(() => {
            expect(screen.queryByText('clear-test.txt')).not.toBeInTheDocument();
        });
    });
});