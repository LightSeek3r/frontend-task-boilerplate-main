interface ProgressBarProps {
    progress: number;
    className?: string;
    showLabel?: boolean;
}

/**
 * Progress bar component for upload progress visualization
 */
export const ProgressBar = ({
    progress,
    className = '',
    showLabel = false,
}: ProgressBarProps) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className={`w-full ${className}`}>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${clampedProgress}%` }}
                    role="progressbar"
                    aria-valuenow={clampedProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
            {showLabel && (
                <div className="mt-1 text-right text-sm text-gray-600">
                    {clampedProgress.toFixed(0)}%
                </div>
            )}
        </div>
    );
};