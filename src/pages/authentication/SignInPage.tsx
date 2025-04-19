import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthService } from '../../services/authService';
import handleError from '../../utils/handleError';

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().nonempty('Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const SignInPage = () => {
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await AuthService.login(data.email, data.password);
            const decodedToken = AuthService.decodeToken(response.token);
            if (decodedToken.isVerified) {
                navigate('/dashboard');
            } else {
                const email = data.email;
                navigate(`/verify-email?email=${encodeURIComponent(email)}`);
            }
        } catch (error: unknown) {
            handleError(error, true);
        }
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-300 to-white">
                <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
                    <h2 className="mb-6 text-2xl font-bold text-blue-800">Sign In</h2>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-700">Email</label>
                            <input
                                type="email"
                                {...register('email')}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        <div className="relative mb-6">
                            <label className="block mb-1 text-gray-700">Password</label>
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

                        <div className="mb-6 text-sm text-right">
                            <a href="/forgot-password" className="text-blue-600 hover:underline">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="w-full p-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Login
                        </button>
                        <div className="mt-4 text-sm text-center">
                            <span className="text-gray-600">Don't have an account? </span>
                            <a
                                href="/signup"
                                className="font-medium text-blue-600 hover:underline"
                            >
                                Create one
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SignInPage;
