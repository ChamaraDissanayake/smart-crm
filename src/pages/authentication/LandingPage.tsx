import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-white">
            <div className="px-4 text-center">
                <h1 className="mb-6 text-4xl font-bold text-blue-800">Welcome to Smart Global CRM</h1>
                <p className="mb-8 text-lg text-gray-600">AI-powered CRM and Chatbot Platform</p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Link
                        to="/signup"
                        className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg"
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/signin"
                        className="px-6 py-3 font-medium text-blue-600 transition-colors bg-white border border-blue-600 rounded-lg shadow-md hover:bg-blue-50 hover:shadow-lg"
                    >
                        Sign In
                    </Link>
                </div>
            </div>

            {/* Optional feature highlights */}
            <div className="grid max-w-4xl grid-cols-1 gap-8 px-4 mt-16 md:grid-cols-3">
                <div className="p-6 bg-white shadow-md rounded-xl">
                    <h3 className="mb-2 text-lg font-semibold text-blue-700">AI-Powered</h3>
                    <p className="text-gray-600">Automate Your Leads and Pipelines</p>
                </div>
                <div className="p-6 bg-white shadow-md rounded-xl">
                    <h3 className="mb-2 text-lg font-semibold text-blue-700">Easy to Use</h3>
                    <p className="text-gray-600">No learning curve needed</p>
                </div>
                <div className="p-6 bg-white shadow-md rounded-xl">
                    <h3 className="mb-2 text-lg font-semibold text-blue-700">24/7 Support</h3>
                    <p className="text-gray-600">Dedicated customer service</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;