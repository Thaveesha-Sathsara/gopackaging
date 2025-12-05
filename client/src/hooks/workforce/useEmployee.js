import axiosInstance from "@/src/services/axiosInstance";
import { errorAlert } from "@/src/lib/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; 

const ROUTE = "/api/workforce/employee";

export const useEmployee = (id) => {
    const queryClient = useQueryClient();

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
        stableTime: 1000 * 60 * 5,
        enabled: !id,
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    //fetch a single employee by mongoID
    const { data: employee, isLoading: isLoadingSingle } = useQuery({
        queryKey: ["Employee", id],
        queryFn: async () => {
            try {
                console.log(`Fecthing employee with ID ${id} from:`, `${ROUTE}/${id}`);
                const reponse = await axiosInstance.get(`${ROUTE}/${id}`);
                return reponse.data;
            } catch (error) {
                handleError("Error fetching single employee.", error);
                throw error;
            }
        },
        enabled: !!id, // Only run this query if an ID is provided
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    const { mutate: createEmployee } = useMutation({
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
            queryClient.invalidateQueries(["Employee"]);
        },
    });

    const { mutate: patchEmployee } = useMutation({
        mutationFn: async (data) => {
            console.log("Called patchEmployee with ID:", id);
            console.log("Update data:", data);
            try {
                const reponse = await axiosInstance.patch(`${ROUTE}/${id}`, data);
                return reponse.data;
            } catch (err) {
                console.error("Error in patchEmployee:", err);
                handleError("Error patching employee.", err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["Employee", id]);
            queryClient.invalidateQueries(["Employees"]);
        },
    });
    
    const { mutate: updateEmployee } = useMutation({
        mutationFn: async (updateData) => {
            console.log("Called updateEmployee with ID:", id);
            console.log("Update data:", updateData);
            try {
                const response = await axiosInstance.put(`${ROUTE}/${id}`, updateData);
                return response.data;
            } catch (err) {
                console.error("Error in updateEmployee:", err);
                handleError("Error updting employee.", err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["Employees"]);
            queryClient.invalidateQueries(["Employee"]);
        },
    });

    const { mutate: deleteEmployee } = useMutation({
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
            queryClient.invalidateQueries(["Employee"]);
        },
    });

    const handleError = (message, err) => {
        console.error(message, err.response?.data || err);
        const errorDetails = err.response?.data?.error || "Unknown error occurred.";
        const newMessage = `
<span style="color: gray; font-size: 18px;">${message}</span><br>
<span style="color: red; font-size: 20px;">${errorDetails}</span>
`;
        errorAlert("Error", newMessage);
    };

    return {
        employees,
        employee,
        isLoading: id ? isLoadingSingle : isLoadingAll,
        createEmployee,
        patchEmployee,
        updateEmployee,
        deleteEmployee,
    };
};