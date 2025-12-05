import axiosInstance from "@/src/services/axiosInstance";
import { errorAlert, createAlert } from "@/src/lib/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const ROUTE_PREFIX = "/api/workforce/attendance";

// Helper to format date as "YYYY-MM-DD" using local time
const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const useAttendance = (startDate, endDate, date, employeeId) => {
    const queryClient = useQueryClient();

    // ✅ FIX: Defensive coding. If endDate is missing (single click), use startDate.
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate || startDate);
    const dateStr = formatDate(date);

    /**
     * Query to fetch the attendance summary for the dashboard
     */
    const { data: attendanceSummary, isLoading: isLoadingSummary, refetch: refetchSummary } = useQuery({
        // Query key now relies on the safe strings
        queryKey: ["attendanceSummary", startStr, endStr],
        queryFn: async () => {
            if (!startStr || !endStr) return [];
            try {
                const response = await axiosInstance.get(`${ROUTE_PREFIX}/summary`, {
                    params: { 
                        startDate: startStr, 
                        endDate: endStr 
                    },
                });
                return response.data;
            } catch (error) {
                handleError("Error fetching attendance summary.", error);
                throw error;
            }
        },
        // Enable query even if only startStr is present (since endStr defaults to it)
        enabled: !!startStr,
        retry: 1,
    });

    /**
     * Query to fetch daily records for the "Create" page
     */
    const { data: dailyRecords, isLoading: isLoadingDaily } = useQuery({
        queryKey: ["dailyAttendance", dateStr],
        queryFn: async () => {
            if (!dateStr) return [];
            try {
                const response = await axiosInstance.get(`${ROUTE_PREFIX}/daily`, {
                    params: { date: dateStr },
                });
                return response.data;
            } catch (error) {
                handleError("Error fetching daily records.", error);
                throw error;
            }
        },
        enabled: !!dateStr, 
    });

    const { data: employeeHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ["employeeAttendanceHistory", employeeId, startStr, endStr],
        queryFn: async () => {
            if (!employeeId || !startStr || !endStr) return null;
            try {
                const response = await axiosInstance.get(`${ROUTE_PREFIX}/employee/${employeeId}`, {
                    params: { startDate: startStr, endDate: endStr },
                });
                return response.data;
            } catch (error) {
                handleError("Error fetching history.", error);
                throw error;
            }
        },
        enabled: !!employeeId && !!startStr,
    });

    /**
     * Mutation to create/update the daily attendance records
     */
    const { mutate: createDailyAttendance, isPending: isSaving } = useMutation({
        mutationFn: async (data) => {
            try {
                const payload = {
                    ...data,
                    date: formatDate(data.date) 
                };
                const response = await axiosInstance.post(`${ROUTE_PREFIX}/daily`, payload);
                return response.data;
            } catch (err) {
                handleError("Error saving attendance.", err);
                throw err;
            }
        },
        onSuccess: () => {
            createAlert("Attendance Saved!");
            queryClient.invalidateQueries(["attendanceSummary"]);
            queryClient.invalidateQueries(["dailyAttendance"]); 
        },
    });

    const handleError = (message, err) => {
        console.error(message, err.response?.data || err);
        const errorDetails = err.response?.data?.message || "Unknown error occurred.";
        const newMessage = `
<span style="color: gray; font-size: 18px;">${message}</span><br>
<span style="color: red; font-size: 20px;">${errorDetails}</span>
`;
        errorAlert("Error", newMessage);
    };

    return {
        attendanceSummary,
        isLoadingSummary,
        refetchSummary,
        dailyRecords,
        isLoadingDaily,
        createDailyAttendance,
        isSaving,
        employeeHistory,
        isLoadingHistory
    };
};