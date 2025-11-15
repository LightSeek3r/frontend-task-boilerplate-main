import type { UploadCallbacks, UploadResponse } from './types';
import type { UploadStrategy } from './UploadStrategy';

/**
 * Chunked upload implementation for large files.
 * Splits files into smaller chunks and uploads them sequentially.
 */
export class ChunkedUpload implements UploadStrategy {
    constructor(
        private readonly endpoint: string = '/api/upload-chunk',
        private readonly chunkSize: number = 1024 * 1024 // 1MB default
    ) {}

    async upload(file: File, callbacks: UploadCallbacks): Promise<void> {
        const totalChunks = Math.ceil(file.size / this.chunkSize);
        let uploadedChunks = 0;

        try {
            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * this.chunkSize;
                const end = Math.min(start + this.chunkSize, file.size);
                const chunk = file.slice(start, end);

                await this.uploadChunk(chunk, file.name, chunkIndex, totalChunks);

                uploadedChunks++;
                const progress = (uploadedChunks / totalChunks) * 100;
                callbacks.onProgress(progress);
            }

            callbacks.onSuccess(file.name);
        } catch (error) {
            callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
        }
    }

    private async uploadChunk(
        chunk: Blob,
        fileName: string,
        currentChunkIndex: number,
        totalChunks: number
    ): Promise<void> {
        const formData = new FormData();
        formData.append('file', chunk, fileName);
        formData.append('currentChunkIndex', currentChunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());

        const response = await fetch(this.endpoint, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = (await response.json()) as { error?: string };
            throw new Error(errorData.error || `Chunk upload failed with status ${response.status}`);
        }

        // Validate response
        (await response.json()) as UploadResponse;
    }
}