import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../../services/AuthService';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { useResendTimer } from '../../hooks/useResendTimer';
import { ResendLink } from '../../components/shared/ResendCountdown';


const VerifyEmailPage = () => {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const {
        attempts: resendAttempts,
        isDisabled: isResendDisabled,
        cooldown: cooldownTime,
        maxAttempts,
        formatTime,
        startCooldown,
    } = useResendTimer(3, 8);

    const resendVerificationEmail = () => {
        if (resendAttempts >= maxAttempts) {
            toast.error('You have reached the resend limit.');
            return;
        }

        const email = searchParams.get('email');
        const token = searchParams.get('token');
        const decoded = token ? AuthService.decodeToken(token) : null;

        const emailToUse = email || decoded?.email;

        if (!emailToUse) {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
            return;
        }

        startCooldown();

        AuthService.resendVerificationEmail(emailToUse)
            .then(() => {
                toast.success('Verification email resent successfully. Please check your inbox.');
            })
            .catch((error) => {
                console.error(error);
                toast.error('Failed to resend verification email. Please try again later.');
            });
    };

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Please check your email inbox and verify. Then click Continue to proceed.');
                return;
            }

            try {
                const result = await AuthService.verifyEmail(token);
                if (result.isVerified) {
                    const userId = AuthService.decodeToken(token).userId;
                    setStatus('success');
                    setMessage('You are ready to proceed!');
                    setTimeout(() => {
                        navigate(`/company-info?userId=${userId}`);
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(
                        'Verification Email sent. Kindly check your email inbox and click the verification link to proceed. If you have already verified your email, please click the button below to continue. Thank you!'
                    );
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('Invalid or expired verification link.');
            }
        };
        verify();
    }, [searchParams, navigate]);

    const checkVerification = useCallback(async () => {
        const email = searchParams.get('email');
        if (email) {
            const result = await AuthService.verificationCheck(email);
            if (result.isVerified) {
                setStatus('success');
                setMessage('You are ready to proceed!');
                setTimeout(() => {
                    navigate(`/company-info?userId=${result.userId}`);
                }, 2000);
            } else {
                setStatus('error');
                setMessage('Verification Email sent. Kindly check your email inbox and click the verification link to proceed. If you have already verified your email, please click the button below to continue. Thank you!');
            }
        } else {
            setStatus('error');
            setMessage('Can not find valid email address');
        }
    }, [navigate, searchParams]);

    useEffect(() => {
        checkVerification();
    }, [checkVerification]);

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-[#E1DBF3]">
            <div className="w-full max-w-md p-8 text-center bg-white border border-gray-200 shadow-sm rounded-2xl">
                {status === 'verifying' && (
                    <div className="space-y-6">
                        <div className="animate-pulse">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-100 to-blue-50">
                                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900">Verifying your email</h3>
                        <p className="text-gray-1000">Please check your email and confirm it's you! If can not able to find kindly check inside your Spam emails</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
                        <p className="text-gray-600">{message}</p>
                        <div className="pt-2">
                            <div className="inline-flex items-center text-sm text-blue-500">
                                <svg className="w-4 h-4 mr-1.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Redirecting...
                            </div>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Confirm Your Email!</h2>
                        <p className="text-gray-600 whitespace-pre-line">{message}</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => checkVerification()}
                                className="w-full px-4 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 ease-out hover:shadow-md"
                            >
                                Continue
                            </button>

                            <button
                                onClick={() => navigate('/signup')}
                                className="w-full px-4 py-2.5 text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 ease-out"
                            >
                                Back to Sign Up
                            </button>

                            <ResendLink
                                isDisabled={isResendDisabled}
                                cooldown={cooldownTime}
                                attempts={resendAttempts}
                                maxAttempts={maxAttempts}
                                formatTime={formatTime}
                                onResend={resendVerificationEmail}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;