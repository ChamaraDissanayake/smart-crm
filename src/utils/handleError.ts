import axios from 'axios';
import { toast } from 'react-toastify'; // or your preferred toast lib

export default function handleError(error: unknown, useToast = true): string {
    let errorMessage = 'Something went wrong';

    if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message || errorMessage;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    if (useToast) {
        toast.error(errorMessage);
    }

    return errorMessage;
}