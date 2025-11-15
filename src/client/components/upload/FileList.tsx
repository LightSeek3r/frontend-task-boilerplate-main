import { UploadStatus } from '../../services/types';
import { Button } from '../ui/Button';
import { FileItem } from './FileItem';
import { useUploadContext } from './hooks/useUploadContext';

interface FileListProps {
    className?: string;
    showClearButton?: boolean;
}

/**
 * File list component that displays all files with their upload status.
 * Can be used standalone or integrated with FileUploader.
 */
export const FileList = ({ className = '', showClearButton = true }: FileListProps) => {
    const { files, removeFile, clearCompleted } = useUploadContext();

    if (files.length === 0) {
        return null;
    }

    const hasCompleted = files.some(
        (f) => f.status === UploadStatus.SUCCESS || f.status === UploadStatus.ERROR
    );

    const completedCount = files.filter((f) => f.status === UploadStatus.SUCCESS).length;
    const failedCount = files.filter((f) => f.status === UploadStatus.ERROR).length;
    const uploadingCount = files.filter((f) => f.status === UploadStatus.UPLOADING).length;

    return (
        <div className={className}>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Files ({files.length})
                    </h2>
                    <p className="text-sm text-gray-600">
                        {completedCount > 0 && `${completedCount} completed`}
                        {completedCount > 0 && failedCount > 0 && ' • '}
                        {failedCount > 0 && `${failedCount} failed`}
                        {uploadingCount > 0 &&
                            (completedCount > 0 || failedCount > 0) &&
                            ' • '}
                        {uploadingCount > 0 && `${uploadingCount} uploading`}
                    </p>
                </div>

                {showClearButton && hasCompleted && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={clearCompleted}
                        aria-label="Clear completed uploads"
                    >
                        Clear Completed
                    </Button>
                )}
            </div>

            <ul className="space-y-2" role="list" aria-label="Upload queue">
                {files.map((file) => (
                    <FileItem key={file.id} file={file} onRemove={removeFile} />
                ))}
            </ul>
        </div>
    );
};