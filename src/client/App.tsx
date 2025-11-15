import { useState, type ReactElement } from 'react';

// Components
import { Button } from './components/ui/Button';
import { FileList } from './components/upload/FileList';
import { FileUploader } from './components/upload/FileUploader';
import { UploadProvider } from './components/upload/UploadContext';

// Services
import { ChunkedUpload } from './services/ChunkedUpload';
import { StandardUpload } from './services/StandardUpload';
import type { UploadStrategy } from './services/UploadStrategy';

export const App = (): ReactElement => {
    
    const [uploadStrategy, setUploadStrategy] = useState<UploadStrategy>(
        () => new StandardUpload()
    );
    const [strategyType, setStrategyType] = useState<'standard' | 'chunked'>('standard');

    const handleStrategyChange = (type: 'standard' | 'chunked') => {
        setStrategyType(type);
        setUploadStrategy(
            type === 'standard' ? new StandardUpload() : new ChunkedUpload(undefined, 512 * 1024)
        );
    };

    return (
        <main className="relative isolate h-dvh">
            <img
                src="https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoid2VhcmVcL2FjY291bnRzXC82ZVwvNDAwMDM4OFwvcHJvamVjdHNcLzk4NFwvYXNzZXRzXC9iOFwvMTE1MjY1XC8xMjYwMTU0YzFhYmVmMDVjNjZlY2Q2MDdmMTRhZTkxNS0xNjM4MjU4MjQwLmpwZyJ9:weare:_kpZgwnGPTxOhYxIyfS1MhuZmxGrFCzP6ZW6dc-F6BQ?width=2400"
                alt="background image"
                aria-hidden="true"
                className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
            />

            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        File Upload Demo
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Demonstrating pluggable upload strategies with drag & drop support
                    </p>
                </div>

                {/* Strategy Selector */}
                <div className="mb-6 rounded-lg bg-white p-4 shadow">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Upload Strategy:
                    </label>
                    <div className="flex gap-2">
                        <Button
                            variant={strategyType === 'standard' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleStrategyChange('standard')}
                        >
                            Standard Upload
                        </Button>
                        <Button
                            variant={strategyType === 'chunked' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleStrategyChange('chunked')}
                        >
                            Chunked Upload (512KB chunks)
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {strategyType === 'standard'
                            ? 'Files are uploaded in a single request with progress tracking'
                            : 'Files are split into chunks and uploaded sequentially'}
                    </p>
                </div>

                {/* Upload Component */}
                <UploadProvider uploadStrategy={uploadStrategy}>
                    <div className="space-y-6">
                        <FileUploader
                            multiple
                            maxFileSize={10 * 1024 * 1024} // 10MB
                            className="rounded-lg bg-white p-6 shadow"
                        />

                        <FileList className="rounded-lg bg-white p-6 shadow" />
                    </div>
                </UploadProvider>

                {/* Info Section */}
                <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                    <h3 className="font-semibold">Features:</h3>
                    <ul className="ml-4 mt-2 list-disc space-y-1">
                        <li>Drag and drop or click to select files</li>
                        <li>Pluggable upload strategies (standard vs chunked)</li>
                        <li>Real-time progress tracking</li>
                        <li>File size validation (max 10MB)</li>
                        <li>Keyboard accessible (Tab, Enter, Space)</li>
                        <li>Screen reader compatible</li>
                    </ul>
                </div>
            </div>
        </main>
    );
};