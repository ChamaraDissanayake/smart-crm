import { toast } from 'react-toastify';
import api from '../Api';

interface UploadResponse {
    fileId: string;
    path: string;
    url: string;
    mimeType: string;
    size: number;
}

class FileUploadService {
    private static BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

    static async uploadFile(file: File, onProgress?: (percentage: number) => void): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                },
            });

            return {
                fileId: response.data.fileId,
                path: response.data.path,
                url: `${this.BASE_URL}/${response.data.path}`,
                mimeType: file.type,
                size: file.size,
            };
        } catch (error) {
            console.error('File upload failed:', error);
            toast.error(`File upload failed: ${file.name}`);
            throw error;
        }
    }

    static async uploadFiles(files: File[], onProgress?: (file: string, percentage: number) => void): Promise<UploadResponse[]> {
        return Promise.all(
            files.map(async (file) => {
                return this.uploadFile(file, (percentage) => {
                    onProgress?.(file.name, percentage);
                });
            })
        );
    }
}

export default FileUploadService;