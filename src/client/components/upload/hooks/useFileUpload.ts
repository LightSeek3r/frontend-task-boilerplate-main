import { useCallback, useState, useRef } from 'react';

interface UseFileUploadOptions {
    accept?: string;
    multiple?: boolean;
    maxFileSize?: number; // in bytes
    onFilesSelected?: (files: File[]) => void;
    onError?: (error: string) => void;
}

interface UseFileUploadReturn {
    isDragging: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
    handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDragEnter: (event: React.DragEvent) => void;
    handleDragLeave: (event: React.DragEvent) => void;
    handleDragOver: (event: React.DragEvent) => void;
    handleDrop: (event: React.DragEvent) => void;
    openFilePicker: () => void;
}

/**
 * Hook that handles file selection logic including drag & drop.
 * Validates files and provides callbacks for successful selection or errors.
 */
export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
    const { accept, multiple = true, maxFileSize, onFilesSelected, onError } = options;
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFiles = useCallback(
        (files: File[]): { valid: File[]; errors: string[] } => {
            const valid: File[] = [];
            const errors: string[] = [];

            files.forEach((file) => {
                // Check file size
                if (maxFileSize && file.size > maxFileSize) {
                    errors.push(
                        `${file.name} exceeds maximum file size of ${maxFileSize / 1024 / 1024}MB`
                    );
                    return;
                }

                // Check file type if accept is specified
                if (accept) {
                    const acceptedTypes = accept.split(',').map((type) => type.trim());
                    const fileType = file.type;
                    const fileExtension = `.${file.name.split('.').pop()}`;

                    const isAccepted = acceptedTypes.some((type) => {
                        if (type.startsWith('.')) {
                            return fileExtension.toLowerCase() === type.toLowerCase();
                        }
                        if (type.endsWith('/*')) {
                            const category = type.split('/')[0];
                            return fileType.startsWith(`${category}/`);
                        }
                        return fileType === type;
                    });

                    if (!isAccepted) {
                        errors.push(`${file.name} is not an accepted file type`);
                        return;
                    }
                }

                valid.push(file);
            });

            return { valid, errors };
        },
        [accept, maxFileSize]
    );

    const processFiles = useCallback(
        (files: FileList | null) => {
            if (!files || files.length === 0) return;

            const fileArray = Array.from(files);
            const { valid, errors } = validateFiles(fileArray);

            if (errors.length > 0 && onError) {
                onError(errors.join('\n'));
            }

            if (valid.length > 0 && onFilesSelected) {
                onFilesSelected(valid);
            }

            // Clear input value to allow selecting the same file again
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        },
        [validateFiles, onFilesSelected, onError]
    );

    const handleFileSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            processFiles(event.target.files);
        },
        [processFiles]
    );

    const handleDragEnter = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();

        // Only set dragging to false if leaving the dropzone itself
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;

        if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);

            const { files } = event.dataTransfer;
            processFiles(files);
        },
        [processFiles]
    );

    const openFilePicker = useCallback(() => {
        inputRef.current?.click();
    }, []);

    return {
        isDragging,
        inputRef,
        handleFileSelect,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        openFilePicker,
    };
};
