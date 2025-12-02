import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/src/services/axiosInstance";

export const useDashboard = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboardStats"],
        queryFn: async () => {
            const res = await axiosInstance.get("/api/dashboard");
            return res.data;
        },
        refetchInterval: 60000, // Auto-refresh every minute (Real-time feel!)
    });

    return { data, isLoading, error };
};