import axiosInstance from "@/src/services/axiosInstance";
import { errorAlert } from "@/src/lib/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; 

const ROUTE = "/api/workforce/employee";

export const useEmployee = (id) => {
    const queryClient = useQueryClient();

    const handleError = (message, err) => {
        console.error(message, err.response?.data || err);
        // ✅ FIX: Check for 'message' (from your controller) OR 'error'
        const errorDetails = err.response?.data?.message || err.response?.data?.error || "Unknown error occurred.";
        
        const newMessage = `
            <span style="color: gray; font-size: 18px;">${message}</span><br>
            <span style="color: red; font-size: 20px;">${errorDetails}</span>
        `;
        errorAlert("Error", newMessage);
    };

    // Fetch All Employees
    const { data: employees, isLoading: isLoadingAll } = useQuery({
        queryKey: ["Employees"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`${ROUTE}/`);
                return response.data;
            } catch (error) {
                handleError("Error fetching employees.", error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
        enabled: !id, // Only fetch list if NO id is provided
        retry: 3,
    });

    // Fetch Single Employee
    const { data: employee, isLoading: isLoadingSingle } = useQuery({
        queryKey: ["Employee", id],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`${ROUTE}/${id}`);
                return response.data;
            } catch (error) {
                handleError("Error fetching single employee.", error);
                throw error;
            }
        },
        enabled: !!id, 
        retry: 3,
    });

    // ✅ CREATE: Use mutateAsync so we can await it in the UI
    const { mutateAsync: createEmployee } = useMutation({
        mutationFn: async (data) => {
            try {
                const response = await axiosInstance.post(`${ROUTE}/`, data);
                return response.data;
            } catch (err) {
                handleError("Error creating employee.", err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["Employees"]);
        },
    });

    // ✅ PATCH: Use mutateAsync
    const { mutateAsync: patchEmployee } = useMutation({
        mutationFn: async (data) => {
            try {
                const response = await axiosInstance.patch(`${ROUTE}/${id}`, data);
                return response.data;
            } catch (err) {
                handleError("Error patching employee.", err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["Employee", id]);
            queryClient.invalidateQueries(["Employees"]);
        },
    });
    
    // ✅ DELETE: Use mutateAsync
    const { mutateAsync: deleteEmployee } = useMutation({
        mutationFn: async (id) => {
            try {
                const response = await axiosInstance.delete(`${ROUTE}/${id}`);
                return response.data;
            } catch (err) {
                handleError("Error deleting employee.", err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["Employees"]);
        },
    });

    return {
        employees,
        employee,
        isLoading: id ? isLoadingSingle : isLoadingAll,
        createEmployee,
        patchEmployee,
        deleteEmployee,
    };
};