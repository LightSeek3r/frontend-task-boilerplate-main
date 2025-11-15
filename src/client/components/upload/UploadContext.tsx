import { createContext, type ReactNode, useCallback, useState } from 'react';

import type { UploadStrategy } from '../../services/UploadStrategy';
import { UploadStatus, type UploadFile } from '../../services/types';
import { generateFileId } from '../../utils/formatters';

interface UploadContextValue {
    files: UploadFile[];
    uploadStrategy: UploadStrategy;
    addFiles: (files: File[]) => void;
    removeFile: (fileId: string) => void;
    clearCompleted: () => void;
}

export const UploadContext = createContext<UploadContextValue | null>(null);

interface UploadProviderProps {
    children: ReactNode;
    uploadStrategy: UploadStrategy;
}

/**
 * Provider component that manages upload state and coordinates file uploads.
 * Uses the Strategy pattern to support different upload implementations.
 */
export const UploadProvider = ({ children, uploadStrategy }: UploadProviderProps) => {
    const [files, setFiles] = useState<UploadFile[]>([]);

    const addFiles = useCallback(
        (newFiles: File[]) => {
            const uploadFiles: UploadFile[] = newFiles.map((file) => ({
                id: generateFileId(),
                file,
                status: UploadStatus.PENDING,
                progress: 0,
            }));

            setFiles((prev) => [...prev, ...uploadFiles]);

            uploadFiles.forEach((uploadFile) => {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === uploadFile.id ? { ...f, status: UploadStatus.UPLOADING } : f
                    )
                );

                uploadStrategy
                    .upload(uploadFile.file, {
                        onProgress: (progress) => {
                            setFiles((prev) =>
                                prev.map((f) =>
                                    f.id === uploadFile.id
                                        ? { ...f, progress: Math.round(progress) }
                                        : f
                                )
                            );
                        },
                        onSuccess: () => {
                            setFiles((prev) =>
                                prev.map((f) =>
                                    f.id === uploadFile.id
                                        ? {
                                              ...f,
                                              status: UploadStatus.SUCCESS,
                                              progress: 100,
                                              uploadedAt: new Date(),
                                          }
                                        : f
                                )
                            );
                        },
                        onError: (error) => {
                            setFiles((prev) =>
                                prev.map((f) =>
                                    f.id === uploadFile.id
                                        ? {
                                              ...f,
                                              status: UploadStatus.ERROR,
                                              error: error.message,
                                          }
                                        : f
                                )
                            );
                        },
                    })
                    .catch((error) => {
                        console.error('Upload error:', error);
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === uploadFile.id
                                    ? {
                                          ...f,
                                          status: UploadStatus.ERROR,
                                          error: 'Upload failed',
                                      }
                                    : f
                            )
                        );
                    });
            });
        },
        [uploadStrategy]
    );

    const removeFile = useCallback((fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
    }, []);

    const clearCompleted = useCallback(() => {
        setFiles((prev) =>
            prev.filter(
                (f) => f.status !== UploadStatus.SUCCESS && f.status !== UploadStatus.ERROR
            )
        );
    }, []);

    return (
        <UploadContext.Provider
            value={{
                files,
                uploadStrategy,
                addFiles,
                removeFile,
                clearCompleted,
            }}
        >
            {children}
        </UploadContext.Provider>
    );
};