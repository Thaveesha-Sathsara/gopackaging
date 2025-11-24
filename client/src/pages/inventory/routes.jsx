import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import FinishedGoods from "./finished-goods/finishedGoods.jsx";
import RawMaterials from "./raw-materials/rawMaterials.jsx";
import RawMaterialForm from "./raw-materials/rawMaterialsForm.jsx";
import FinishedGoodForm from "./finished-goods/finishedGoodsForm.jsx";

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
        path: "/inventory/raw-materials/create",
        element: (
            <ProtectedRoute>
                <RawMaterialForm />
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
    {
        path: "/inventory/finished-goods/create",
        element: (
            <ProtectedRoute>
                <FinishedGoodForm />
            </ProtectedRoute>
        )
    }
]