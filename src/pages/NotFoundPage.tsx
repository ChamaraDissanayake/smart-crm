import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
            <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="font-extrabold text-gray-400 text-9xl">404</h1>
                <h2 className="mt-6 text-3xl font-bold text-gray-900">Page not found</h2>
                <p className="mt-4 text-lg text-gray-600">
                    Sorry, we couldn't find the page you're looking for.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => navigate("/")}
                            className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Go to homepage
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="flex justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Go back
                        </button>
                    </div>

                    <div className="pt-6 mt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Need help?{' '}
                            <a
                                href="/contact"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Contact support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;