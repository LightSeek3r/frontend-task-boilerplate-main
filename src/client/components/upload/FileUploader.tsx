import { useCallback, useState } from 'react';

import { Button } from '../ui/Button';
import { useFileUpload } from './hooks/useFileUpload';
import { useUploadContext } from './hooks/useUploadContext';

interface FileUploaderProps {
    accept?: string;
    multiple?: boolean;
    maxFileSize?: number;
    className?: string;
}

/**
 * File uploader component with drag & drop support.
 * Can be used standalone or within an UploadProvider for automatic upload handling.
 */
export const FileUploader = ({
    accept,
    multiple = true,
    maxFileSize,
    className = '',
}: FileUploaderProps) => {
    const { addFiles } = useUploadContext();
    const [error, setError] = useState<string | null>(null);

    const handleFilesSelected = useCallback(
        (files: File[]) => {
            setError(null);
            addFiles(files);
        },
        [addFiles]
    );

    const handleError = useCallback((errorMessage: string) => {
        setError(errorMessage);
    }, []);

    const {
        isDragging,
        inputRef,
        handleFileSelect,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        openFilePicker,
    } = useFileUpload({
        accept,
        multiple,
        maxFileSize,
        onFilesSelected: handleFilesSelected,
        onError: handleError,
    });

    return (
        <div className={className}>
            <div
                className={`
                    relative rounded-lg border-2 border-dashed p-8 text-center transition-colors
                    ${
                        isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                `}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload files area"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openFilePicker();
                    }
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    aria-label="File input"
                />

                <div className="space-y-4">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    <div className="text-gray-600">
                        <p className="text-lg font-medium">
                            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
                        </p>
                        <p className="mt-1 text-sm">or</p>
                    </div>

                    <Button onClick={openFilePicker} variant="primary">
                        Choose Files
                    </Button>

                    {(accept || maxFileSize) && (
                        <p className="text-xs text-gray-500">
                            {accept && `Accepted types: ${accept}`}
                            {accept && maxFileSize && ' • '}
                            {maxFileSize && `Max size: ${maxFileSize / 1024 / 1024}MB`}
                        </p>
                    )}
                </div>
            </div>

            {error && (
                <div
                    className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </div>
            )}
        </div>
    );
};