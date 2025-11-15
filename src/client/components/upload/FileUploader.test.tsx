import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StandardUpload } from '../../services/StandardUpload';
import { UploadProvider } from './UploadContext';
import { FileUploader } from './FileUploader';

describe('FileUploader', () => {
    const renderWithProvider = (component: React.ReactElement) => {
        const mockStrategy = new StandardUpload();
        return render(<UploadProvider uploadStrategy={mockStrategy}>{component}</UploadProvider>);
    };

    it('should render the upload area', () => {
        renderWithProvider(<FileUploader />);

        expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /choose files/i })).toBeInTheDocument();
    });

    it('should open file picker when button is clicked', async () => {
        const user = userEvent.setup();
        renderWithProvider(<FileUploader />);

        const input = screen.getByLabelText(/file input/i) as HTMLInputElement;
        const clickSpy = vi.spyOn(input, 'click');

        const button = screen.getByRole('button', { name: /choose files/i });
        await user.click(button);

        expect(clickSpy).toHaveBeenCalled();
    });

    it('should open file picker on Enter key', async () => {
        const user = userEvent.setup();
        renderWithProvider(<FileUploader />);

        const input = screen.getByLabelText(/file input/i) as HTMLInputElement;
        const clickSpy = vi.spyOn(input, 'click');

        const uploadArea = screen.getByRole('button', { name: /upload files area/i });
        uploadArea.focus();
        await user.keyboard('{Enter}');

        expect(clickSpy).toHaveBeenCalled();
    });

    it('should display accepted file types when provided', () => {
        renderWithProvider(<FileUploader accept=".pdf,.doc" />);

        expect(screen.getByText(/accepted types: .pdf,.doc/i)).toBeInTheDocument();
    });

    it('should display max file size when provided', () => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        renderWithProvider(<FileUploader maxFileSize={maxSize} />);

        expect(screen.getByText(/max size: 5mb/i)).toBeInTheDocument();
    });

    it('should handle file selection', async () => {
        const user = userEvent.setup();
        renderWithProvider(<FileUploader />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/file input/i) as HTMLInputElement;

        await user.upload(input, file);

        // The component clears the input value after processing files to allow re-selection.
        // Context behavior is covered in integration tests. Assert input is cleared.
        expect(input.files).toHaveLength(0);
    });

    it('should support multiple file selection by default', () => {
        renderWithProvider(<FileUploader />);

        const input = screen.getByLabelText(/file input/i) as HTMLInputElement;
        expect(input.multiple).toBe(true);
    });

    it('should support single file selection when multiple is false', () => {
        renderWithProvider(<FileUploader multiple={false} />);

        const input = screen.getByLabelText(/file input/i) as HTMLInputElement;
        expect(input.multiple).toBe(false);
    });

    it('should be keyboard accessible', () => {
        renderWithProvider(<FileUploader />);

        const uploadArea = screen.getByRole('button', { name: /upload files area/i });
        expect(uploadArea).toHaveAttribute('tabIndex', '0');
    });
});