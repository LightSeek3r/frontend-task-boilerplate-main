import type { UploadCallbacks } from './types';

/**
 * Strategy interface for pluggable upload implementations.
 * Allows different upload methods (standard, chunked, GraphQL, etc.).
 */
export interface UploadStrategy {
    /**
     * Upload a file with progress tracking
     * @param file - The file to upload
     * @param callbacks - Progress, success, and error callbacks
     */
    upload(file: File, callbacks: UploadCallbacks): Promise<void>;
}