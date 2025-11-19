import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import EmployeeReports from "./employee-reports/employeeReports";
import InventoryReports from "./inventory-reports/inventoryReports";
import ProductionReports from "./production-reports/productionReports";

export const reportsRoutes = [
    {
        path: "/reports/employee-reports",
        element: (
            <ProtectedRoute>
                <EmployeeReports />
            </ProtectedRoute>
        )
    },
    {
        path: "/reports/inventory-reports",
        element: (
            <ProtectedRoute>
                <InventoryReports />
            </ProtectedRoute>
        )
    },
    {
        path: "/reports/production-reports",
        element: (
            <ProtectedRoute>
                <ProductionReports />
            </ProtectedRoute>
        )
    },
]