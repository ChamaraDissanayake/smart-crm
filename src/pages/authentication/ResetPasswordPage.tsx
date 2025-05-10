import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthService } from '../../services/AuthService';
import handleError from '../../utils/handleError';
import { toast } from 'react-toastify';

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isConfirmVisible, setConfirmVisible] = useState(false);
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            toast.error('Reset token is missing or invalid.');
            navigate('/signin');
        }
    }, [token, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            if (!token) return;
            await AuthService.resetPassword(token, data.password);
            toast.success('Password has been reset successfully.');
            setTimeout(() => navigate('/signin'), 1500);
        } catch (error: unknown) {
            handleError(error, true);
        }
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen px-4 bg-[#E1DBF3]">
                <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
                    <h2 className="mb-6 text-2xl font-bold text-blue-800">Reset Password</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="relative mb-4">
                            <label className="block mb-1 text-gray-700">New Password</label>
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                {...register('password')}
                                className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setPasswordVisible((prev) => !prev)}
                                className="absolute text-gray-500 right-3 top-9"
                            >
                                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="relative mb-6">
                            <label className="block mb-1 text-gray-700">Confirm Password</label>
                            <input
                                type={isConfirmVisible ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setConfirmVisible((prev) => !prev)}
                                className="absolute text-gray-500 right-3 top-9"
                            >
                                {isConfirmVisible ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full p-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ResetPasswordPage;
