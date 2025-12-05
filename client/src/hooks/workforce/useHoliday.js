import { useState, useEffect } from "react";
import { errorAlert } from "@/src/lib/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query"; 
import axiosInstance from "@/src/services/axiosInstance";

const ROUTE = "/api/workforce/holidays";

export const useHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const fetchHolidays = async () => {
        setIsLoading(true);
        try {
            // Adjust URL to match your server port
            const res = await axiosInstance.get(`${ROUTE}`);
            setHolidays(res.data);
        } catch (error) {
            console.error("Failed to fetch holidays", error);
        } finally {
            setIsLoading(false);
        }
    };

    const { mutate: addHoliday } = useMutation({
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

    const { mutate: removeHoliday } = useMutation({
        mutationFn: async (id) => {
            try {
                const response = await axiosInstance.delete(`${ROUTE}/${id}`);
                return response.data;
            } catch (err) {
                handleError("Error deleting holdiay.", err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["Holidays"]);
            queryClient.invalidateQueries(["Holiday"]);
        }
    });

    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleError = (message, err) => {
        console.error(message, err.response?.data || err);
        const errorDetails = err.response?.data?.error || "Unknown error occurred.";
        const newMessage = `
<span style="color: gray; font-size: 18px;">${message}</span><br>
<span style="color: red; font-size: 20px;">${errorDetails}</span>
`;
        errorAlert("Error", newMessage);
    };

    return { holidays, isLoading, addHoliday, removeHoliday };
};