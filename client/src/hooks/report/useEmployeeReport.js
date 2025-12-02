import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/src/services/axiosInstance";

export const useEmployeeReports = (employeeId) => {
    return useQuery({
        queryKey: ["employeeReport", employeeId],
        queryFn: async () => {
            if (!employeeId) return null;
            const { data } = await axiosInstance.get(`/api/reports/employee/${employeeId}`);
            return data;
        },
        enabled: !!employeeId, // Only fetch when an ID is selected
    });
};