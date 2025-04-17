import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gradient-to-br from-blue-900 to-black">
            <h1 className="mb-6 text-4xl font-bold">Welcome to Smart Global CRM</h1>
            <p className="mb-8 text-lg text-gray-300">AI-powered CRM and Chatbot Platform</p>
            <div className="flex gap-4">
                <Link
                    to="/signup"
                    className="px-6 py-2 font-medium text-white bg-blue-600 shadow hover:bg-blue-700 rounded-xl"
                >
                    Sign Up
                </Link>
                <Link
                    to="/signin"
                    className="px-6 py-2 font-medium text-blue-900 bg-white shadow hover:bg-gray-200 rounded-xl"
                >
                    Sign In
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;
