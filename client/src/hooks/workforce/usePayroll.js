import axiosInstance from "@/src/services/axiosInstance";
import { errorAlert } from "@/src/lib/alert";
import { useQuery } from "@tanstack/react-query";

const ROUTE_PREFIX = "/api/workforce/payroll";

const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const usePayroll = (startDate, endDate, employeeId) => {
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);

    // 1. Fetch Main Summary
    const { data: payrollSummary, isLoading: isLoadingSummary, refetch: refetchSummary } = useQuery({
        queryKey: ["payrollSummary", startStr, endStr],
        queryFn: async () => {
            if (!startStr || !endStr) return [];
            try {
                const response = await axiosInstance.get(`${ROUTE_PREFIX}/summary`, {
                    params: { startDate: startStr, endDate: endStr },
                });
                return response.data;
            } catch (error) {
                handleError("Error fetching payroll summary.", error);
                throw error;
            }
        },
        enabled: !!startStr && !!endStr,
    });

    // 2. Fetch Specific Employee Details
    const { data: employeePayroll, isLoading: isLoadingEmployee } = useQuery({
        queryKey: ["employeePayroll", employeeId, startStr, endStr],
        queryFn: async () => {
            if (!employeeId || !startStr || !endStr) return null;
            try {
                const response = await axiosInstance.get(`${ROUTE_PREFIX}/employee/${employeeId}`, {
                    params: { startDate: startStr, endDate: endStr },
                });
                return response.data;
            } catch (error) {
                handleError("Error fetching employee payroll.", error);
                throw error;
            }
        },
        enabled: !!employeeId && !!startStr && !!endStr,
    });

    const handleError = (message, err) => {
        console.error(message, err);
        errorAlert("Error", message);
    };

    return {
        payrollSummary,
        isLoadingSummary,
        refetchSummary,
        employeePayroll,
        isLoadingEmployee
    };
};