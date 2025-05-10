import { useState, useRef, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthService } from '../../services/AuthService';
import handleError from '../../utils/handleError';

// Define login schema
const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().nonempty('Password is required'),
});

// Define register schema
const registerSchema = z
    .object({
        name: z.string().min(2, 'Name is required'),
        email: z.string().email('Invalid email'),
        phone: z.string().optional(),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().nonempty('Confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

type FormData = RegisterFormData & Partial<LoginFormData>;

const SignUpPage = () => {
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [emailExists, setEmailExists] = useState<boolean | null>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const savedFields = useRef<{ name: string; phone?: string; confirmPassword: string; }>({
        name: '',
        phone: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();

    const activeSchema = useMemo(() => {
        return emailExists ? loginSchema : registerSchema;
    }, [emailExists]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(activeSchema as unknown as z.ZodType<FormData>),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
    });

    const email = watch('email');

    useEffect(() => {
        if (!email) return;

        const timeout = setTimeout(async () => {
            const isValid = await trigger('email');
            if (!isValid) return;

            try {
                setCheckingEmail(true);
                const { exists } = await AuthService.checkDuplicateEmail(email);
                setEmailExists(exists);

                if (exists) {
                    // Save fields before clearing them
                    savedFields.current.name = watch('name');
                    savedFields.current.phone = watch('phone');
                    savedFields.current.confirmPassword = watch('confirmPassword');

                    // Clear irrelevant fields
                    setValue('name', '');
                    setValue('phone', '');
                    setValue('confirmPassword', '');
                } else {
                    // Restore saved values
                    setValue('name', savedFields.current.name);
                    setValue('phone', savedFields.current.phone || '');
                    setValue('confirmPassword', savedFields.current.confirmPassword);
                }
            } catch (err) {
                console.error('Email check failed', err);
            } finally {
                setCheckingEmail(false);
            }
        }, 1000); // debounce 1 second

        return () => clearTimeout(timeout);
    }, [email, setValue, trigger, watch]);

    const onRegister = async (data: RegisterFormData): Promise<void> => {
        try {
            await AuthService.signUp({
                email: data.email,
                password: data.password,
                name: data.name,
                phone: data.phone
            });
            navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            console.error('Registration error:', error);
            alert(errorMessage);
        }
    };

    const onLogin = async (): Promise<void> => {
        try {
            const password = watch('password');
            if (!password) throw new Error('Password is required');

            await AuthService.login(email, password);

            navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (error: unknown) {
            console.log('Login error:', error);
            handleError(error, true)
        }
    };

    const handleSubmitForm = (data: FormData) => {
        if (emailExists) {
            onLogin();
        } else {
            onRegister(data as RegisterFormData);
        }
    };

    useEffect(() => {
        const subscription = watch(({ name }) => {
            if (name === 'password') {
                trigger('confirmPassword');
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, trigger]);

    return (
        <>
            <div className="flex items-center justify-center min-h-screen p-4 bg-[#E1DBF3]">
                <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
                    <h2 className="mb-6 text-2xl font-bold text-blue-800">
                        {emailExists ? 'Welcome back!' : 'Create Your Account'}
                    </h2>

                    <form onSubmit={handleSubmit((data: FormData) => handleSubmitForm(data))}>
                        <div className="mb-4">
                            <label className="block mb-1 text-gray-700">Email</label>
                            <input
                                type="email"
                                {...register('email')}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                            {checkingEmail && <p className="mt-1 text-sm text-blue-600">Checking email...</p>}
                        </div>

                        {emailExists ? (
                            <>
                                <div className="relative mb-4">
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
                            </>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label className="block mb-1 text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        {...register('name')}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-1 text-gray-700">Phone</label>
                                    <input
                                        type="text"
                                        {...register('phone')}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                                </div>

                                <div className="relative mb-4">
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

                                <div className="relative mb-6">
                                    <label className="block mb-1 text-gray-700">Confirm Password</label>
                                    <input
                                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                                        {...register('confirmPassword')}
                                        className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                                        className="absolute text-gray-500 right-3 top-9"
                                    >
                                        {isConfirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="w-full p-3 mt-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {emailExists ? 'Login' : 'Next'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">Already have an account?{' '}
                            <a href="/signin" className="font-medium text-blue-600 hover:underline">
                                SignIn
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignUpPage;
