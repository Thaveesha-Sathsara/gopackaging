import axiosInstance from "@/src/services/axiosInstance";
import { errorAlert, createAlert } from "@/src/lib/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const ROUTE_PREFIX = "/api/workforce/attendance";

// Helper to format date as "YYYY-MM-DD" using local time
// This fixes the timezone issue where dates shift to the previous day
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

    // Convert dates to strings immediately. 
    // This stabilizes the query keys and fixes the backend requests.
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);
    const dateStr = formatDate(date);

    /**
     * Query to fetch the attendance summary for the dashboard
     */
    const { data: attendanceSummary, isLoading: isLoadingSummary, refetch: refetchSummary } = useQuery({
        // ✅ Query Key uses strings (stable), not Date objects
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
        // Only run if both strings are valid
        enabled: !!startStr && !!endStr,
        retry: 1,
    });

    /**
     * Query to fetch daily records for the "Create" page
     */
    const { data: dailyRecords, isLoading: isLoadingDaily } = useQuery({
        // ✅ Query Key uses string
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
        // Only run if the date string is valid
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
        enabled: !!employeeId && !!startStr && !!endStr,
    });


    /**
     * Mutation to create/update the daily attendance records
     */
    const { mutate: createDailyAttendance, isPending: isSaving } = useMutation({
        mutationFn: async (data) => {
            try {
                // Ensure the payload uses the formatted date string too
                const payload = {
                    ...data,
                    date: formatDate(data.date) // Ensure this is YYYY-MM-DD
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
            // Invalidate both queries so the UI updates immediately
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