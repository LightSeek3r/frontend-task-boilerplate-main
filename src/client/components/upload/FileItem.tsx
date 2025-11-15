import { UploadStatus, type UploadFile } from '../../services/types';
import { formatFileSize } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

interface FileItemProps {
    file: UploadFile;
}

/**
 * Individual file item component showing upload status and progress
 */
export const FileItem = ({ file }: FileItemProps) => {
    const getStatusIcon = () => {
        switch (file.status) {
            case UploadStatus.SUCCESS:
                return (
                    <svg
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-label="Upload successful"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                );
            case UploadStatus.ERROR:
                return (
                    <svg
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-label="Upload failed"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                );
            case UploadStatus.UPLOADING:
                return (
                    <svg
                        className="h-5 w-5 animate-spin text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-label="Uploading"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                );
            default:
                return (
                    <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-label="Pending"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                );
        }
    };

    const getStatusText = () => {
        switch (file.status) {
            case UploadStatus.SUCCESS:
                return 'Completed';
            case UploadStatus.ERROR:
                return file.error || 'Failed';
            case UploadStatus.UPLOADING:
                return `${file.progress}%`;
            default:
                return 'Pending';
        }
    };

    return (
        <li className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">{getStatusIcon()}</div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {file.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatFileSize(file.file.size)} • {getStatusText()}
                            </p>
                        </div>
                    </div>

                    {file.status === UploadStatus.UPLOADING && (
                        <div className="mt-2">
                            <ProgressBar progress={file.progress} />
                        </div>
                    )}

                    {file.status === UploadStatus.ERROR && file.error && (
                        <p className="mt-1 text-xs text-red-600" role="alert">
                            {file.error}
                        </p>
                    )}
                </div>
            </div>
        </li>
    );
};