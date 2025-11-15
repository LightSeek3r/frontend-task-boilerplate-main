import { useContext } from 'react';

import { UploadContext } from '../UploadContext';

/**
 * Hook to access the upload context.
 * Must be used within an UploadProvider.
 */
export const useUploadContext = () => {
    const context = useContext(UploadContext);

    if (!context) {
        throw new Error('useUploadContext must be used within an UploadProvider');
    }

    return context;
};