import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/dashboard";
import Profile from "./pages/profile/profile";
import ErrorPage from "./pages/ErrorPage";
import RootLayout from "./pages/layout.jsx";
import { workforceRoutes } from "./pages/workforce/routes.jsx";
import { inventoryRoutes } from "./pages/inventory/routes.jsx";
import Production from "./pages/production/production.jsx";
import { reportsRoutes } from "./pages/reports/routes.jsx";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <RootLayout />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile",
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                )
            },
            {
                path: "/production",
                element: (
                    <ProtectedRoute>
                        <Production />
                    </ProtectedRoute>
                )
            },
            ...workforceRoutes,
            ...inventoryRoutes,
            ...reportsRoutes,
        ],
    },
    {
        path: "*",
        element: <ErrorPage />,
    },
]);

export default router;