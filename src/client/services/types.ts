// Core types for the upload system

export enum UploadStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    SUCCESS = 'success',
    ERROR = 'error',
}

export interface UploadFile {
    id: string;
    file: File;
    status: UploadStatus;
    progress: number;
    error?: string;
    uploadedAt?: Date;
}

export interface UploadCallbacks {
    onProgress: (progress: number) => void;
    onSuccess: (fileId: string) => void;
    onError: (error: Error) => void;
}

export interface UploadResponse {
    message: string;
    fileId?: string;
}

export interface FileListResponse {
    files: Array<{
        name: string;
        size: number;
    }>;
}