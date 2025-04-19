import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthService } from '../../services/authService';
import handleError from '../../utils/handleError';
import { toast } from 'react-toastify';
import { useResendTimer } from '../../hooks/useResendTimer';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
    const [emailSent, setEmailSent] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        getValues,
        reset,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const {
        attempts: resendAttempts,
        isDisabled: isResendDisabled,
        cooldown: cooldownTime,
        maxAttempts,
        formatTime,
        startCooldown,
    } = useResendTimer(3, 120);

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await AuthService.forgotPassword(data.email);
            toast.success('Password reset link has been sent to your email.');
            setEmailSent(true);
            startCooldown();
        } catch (error: unknown) {
            handleError(error, true);
        }
    };

    const handleResend = async () => {
        const email = getValues('email');
        if (!email) {
            toast.error('Please enter your email first');
            return;
        }

        try {
            await AuthService.forgotPassword(email);
            toast.success('Password reset link has been resent to your email.');
            startCooldown();
        } catch (error: unknown) {
            handleError(error, true);
        }
    };

    const handleResetForm = () => {
        setEmailSent(false);
        reset();
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-300 to-white">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
                <h2 className="mb-6 text-2xl font-bold text-blue-800">Forgot Password</h2>

                {emailSent ? (
                    <div className="space-y-6">
                        <div className="p-4 text-green-700 bg-green-100 rounded-lg">
                            <p>We've sent a password reset link to your email address.</p>
                            <p className="mt-2">Please check your inbox and follow the instructions.</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleResend}
                                disabled={isResendDisabled || resendAttempts >= maxAttempts}
                                className={`px-4 py-2 font-medium rounded-lg transition-colors ${isResendDisabled || resendAttempts >= maxAttempts
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                    }`}
                            >
                                {isResendDisabled ? (
                                    `Resend available in ${formatTime(cooldownTime)}`
                                ) : (
                                    'Resend Reset Link'
                                )}
                            </button>

                            <button
                                onClick={handleResetForm}
                                className="px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Change Email
                            </button>
                        </div>

                        <div className="text-xs text-center text-gray-500">
                            {resendAttempts > 0 && `Remaining attempts: ${maxAttempts - resendAttempts}/${maxAttempts}`}
                        </div>

                        <div className="pt-4 text-sm text-center border-t border-gray-200">
                            <span className="text-gray-600">Remembered the password? </span>
                            <a
                                href="/signin"
                                className="font-medium text-blue-600 hover:underline"
                            >
                                Sign In
                            </a>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="mb-6 text-sm text-gray-600">
                            Enter your registered email address and we'll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-6">
                                <label className="block mb-1 text-gray-700">Email</label>
                                <input
                                    type="email"
                                    {...register('email')}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full p-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <div className="mt-4 text-sm text-center">
                            <span className="text-gray-600">Remembered the password? </span>
                            <a
                                href="/signin"
                                className="font-medium text-blue-600 hover:underline"
                            >
                                Sign In
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;