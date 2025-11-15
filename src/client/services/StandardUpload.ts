import type { UploadCallbacks, UploadResponse } from './types';
import type { UploadStrategy } from './UploadStrategy';

/**
 * Standard single-request upload implementation.
 * Suitable for smaller files where chunking is not required.
 */
export class StandardUpload implements UploadStrategy {
    constructor(private readonly endpoint: string = '/api/upload-single') {}

    async upload(file: File, callbacks: UploadCallbacks): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    callbacks.onProgress(progress);
                }
            });

            // Handle completion
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText) as UploadResponse;
                    callbacks.onSuccess(response.fileId || file.name);
                } else {
                    const error = new Error(`Upload failed with status ${xhr.status}`);
                    callbacks.onError(error);
                }
            });

            // Handle errors
            xhr.addEventListener('error', () => {
                callbacks.onError(new Error('Network error during upload'));
            });

            xhr.addEventListener('abort', () => {
                callbacks.onError(new Error('Upload aborted'));
            });

            xhr.open('POST', this.endpoint);
            xhr.send(formData);
        } catch (error) {
            callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
        }
    }
}