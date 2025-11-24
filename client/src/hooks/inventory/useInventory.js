import axiosInstance from "@/src/services/axiosInstance";
import { errorAlert, createAlert } from "@/src/lib/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const ROUTE = "/api/inventory";

export const useInventory = (type = "raw-materials") => {
    const queryClient = useQueryClient();
    const queryKey = type === "raw-materials" ? "rawMaterials" : "finishedGoods";

    // Fetch Items
    const { data: items, isLoading } = useQuery({
        queryKey: [queryKey],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`${ROUTE}/${type}`);
                return response.data;
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
    });

    // Create New Item (Definition)
    const { mutate: createItem, isPending: isCreating } = useMutation({
        mutationFn: async (data) => {
            try {
                const response = await axiosInstance.post(`${ROUTE}/${type}`, data);
                return response.data;
            } catch (err) {
                errorAlert("Error creating item", err);
                throw err;
            }
        },
        onSuccess: () => {
            createAlert("Item Created Successfully");
            queryClient.invalidateQueries([queryKey]);
        },
    });

    // Adjust Stock (Add/Remove)
    const { mutate: adjustStock, isPending: isAdjusting } = useMutation({
        mutationFn: async ({ id, adjustment, operationType, date }) => {
            try {
                const response = await axiosInstance.patch(`${ROUTE}/${type}/${id}/adjust`, {
                    adjustment,
                    type: operationType,
                    date: date
                });
                return response.data;
            } catch (err) {
                errorAlert("Error adjusting stock", err);
                throw err;
            }
        },
        onSuccess: () => {
            createAlert("Stock Updated");
            queryClient.invalidateQueries([queryKey]);
            queryClient.invalidateQueries(["itemHistory"]);
        },
    });

    // Update Item Details (Edit)
    const { mutate: updateItem, isPending: isUpdating } = useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                const response = await axiosInstance.patch(`${ROUTE}/${type}/${id}`, data);
                return response.data;
            } catch (err) {
                errorAlert("Error updating item", err);
                throw err;
            }
        },
        onSuccess: () => {
            createAlert("Item Updated Successfully");
            queryClient.invalidateQueries([queryKey]);
        },
    });

    const { mutate: deleteItem, isPending: isDeleting } = useMutation({
        mutationFn: async (id) => {
            try {
                const response = await axiosInstance.delete(`${ROUTE}/${type}/${id}`);
                return response.data;
            } catch (err) {
                errorAlert("Error deleting item", err);
                throw err;
            }
        },
        onSuccess: () => {
            createAlert("Item Deleted Successfully");
            queryClient.invalidateQueries([queryKey]);
        },
    });

    const useItemHistory = (itemId) => {
        return useQuery({
            queryKey: ["itemHistory", itemId],
            queryFn: async () => {
                if (!itemId) return [];
                const response = await axiosInstance.get(`${ROUTE}/history/${itemId}`);
                return response.data;
            },
            enabled: !!itemId
        });
    };

    return {
        items,
        isLoading,
        createItem, isCreating,
        adjustStock, isAdjusting,
        updateItem, isUpdating,
        useItemHistory,
        deleteItem, isDeleting,
    };
};