import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import FinishedGoods from "./finished-goods/finishedGoods.jsx";
import RawMaterials from "./raw-materials/rawMaterials.jsx";

export const inventoryRoutes = [
    {
        path: "/inventory/raw-materials",
        element: (
            <ProtectedRoute>
                <RawMaterials />
            </ProtectedRoute>
        )
    },
    {
        path: "/inventory/finished-goods",
        element: (
            <ProtectedRoute>
                <FinishedGoods />
            </ProtectedRoute>
        )
    },
]