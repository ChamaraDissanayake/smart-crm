import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    userId: string;
    email: string;
    exp: number;
    iat: number;
}

const VerifyEmailPage = () => {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const verify = useCallback(async () => {
        const token = searchParams.get('token');
        const decoded = token ? jwtDecode<DecodedToken>(token) : null;

        if (!token) {
            setStatus('error');
            setMessage('Verification token is missing.');
            return;
        }

        try {
            console.log('Chamara decoded', decoded);

            const result = await AuthService.verifyEmail(token);
            if (result.isVerified) {
                setStatus('success');
                setMessage('You are ready to proceed!');
                setTimeout(() => {
                    // navigate(`/company-info?userId=${decoded?.userId}`);
                    alert('You are ready to proceed!');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(
                    'Kindly check your email inbox and click the verification link to proceed. If you have already verified your email, please click the button below to continue. Thank you!'
                );
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage('Invalid or expired verification link.');
        }
    }, [searchParams]);


    const resendVerificationEmail = () => {
        const token = searchParams.get('token');
        const decoded = token ? jwtDecode<DecodedToken>(token) : null;
        if (!decoded?.email) {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
            return;
        }
        AuthService.resendVerificationEmail(decoded.email)
            .then(() => {
                alert('Verification email resent successfully. Please check your inbox.');
            })
            .catch((error) => {
                console.error(error);
                alert('Failed to resend verification email. Please try again later.');
            });
    };

    useEffect(() => {
        verify();
    }, [verify]);

    return (
        <div className="flex items-center justify-center min-h-screen px-4 text-white bg-black">
            <div className="w-full max-w-md p-6 text-center bg-gray-900 shadow-lg rounded-2xl">
                {status === 'verifying' && <p>Verifying your email...</p>}

                {status === 'success' && (
                    <>
                        <h2 className="mb-2 text-2xl font-bold text-green-400">Success!</h2>
                        <p>{message}</p>
                        <p className="mt-2 text-sm text-gray-400">Redirecting to the next step...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 className="mb-2 text-2xl font-bold text-center text-yellow-300">
                            📩 Confirm Your Email to Get Started
                        </h2>
                        <p className="whitespace-pre-line">{message}</p>

                        <div className="flex flex-col gap-2 mt-4">
                            <button
                                onClick={() => verify()}
                                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                                Verify Email
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600"
                            >
                                Back to Signup
                            </button>
                            <button
                                onClick={() => resendVerificationEmail()}
                                className="px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600"
                            >
                                Resend Verification Email
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
