import axios, { AxiosRequestConfig } from 'axios';
import api from './api';

const fileService = {
    async uploadFile(file: File, config?: AxiosRequestConfig<FormData>) {
        try {
            // Client-side size validation
            if (file.size > 50 * 1024 * 1024) {
                throw new Error('File exceeds 50MB limit');
            }

            const formData = new FormData();
            formData.append('file', file);

            // Merge custom config with default config
            const mergedConfig: AxiosRequestConfig<FormData> = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 300000, // 5 minute timeout for large files
                ...config // Spread the custom config last to allow overrides
            };

            const response = await api.post('/files/upload', formData, mergedConfig);

            // Handle duplicate response
            if (response.data.isDuplicate) {
                console.log('Using existing file:', response.data.path);
            }

            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 413) {
                    throw new Error('File too large (max 50MB)');
                }
                throw new Error(error.response?.data?.message || 'File upload failed');
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Unknown upload error occurred');
        }
    },

    async fetchFiles() {
        return api.get('/files');
    },

    async deleteFile(id: number): Promise<void> {
        await api.delete(`/files/${id}`);
    },

    async getFileUrl(path: string): Promise<string> {
        return path.startsWith('http') ? path : `${import.meta.env.VITE_BASE_URL}/${path}`;
    }
};

export default fileService;