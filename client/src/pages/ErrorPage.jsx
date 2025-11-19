import { buttonVariants } from "../components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  const is404 = !error || (isRouteErrorResponse(error) && error.status === 404);
  const errorMessage = isRouteErrorResponse(error)
    ? error.data || "The page you are looking for does not exist."
    : error instanceof Error
    ? error.message
    : "An unexpected error occurred.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6">
      <div className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-lg w-full text-center">
        <AlertCircle
          className={`w-20 h-20 mb-6 ${
            is404 ? "text-yellow-500" : "text-red-500"
          }`}
        />
        <h1
          className={`text-4xl font-extrabold ${
            is404 ? "text-yellow-600" : "text-red-600"
          } mb-4`}
        >
          {is404 ? "404 - Page Not Found" : "Oops! Something Went Wrong"}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          {is404
            ? "The page you are looking for does not exist."
            : errorMessage}
        </p>
        <Link to="/" className={buttonVariants({ size: "lg" })}>
          <Home className="w-5 h-5 mr-2" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
