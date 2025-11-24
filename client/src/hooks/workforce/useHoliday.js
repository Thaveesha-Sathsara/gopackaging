import { useState, useEffect } from "react";
// Replace with your actual axios instance path
import axios from "axios"; 

export const useHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHolidays = async () => {
        setIsLoading(true);
        try {
            // Adjust URL to match your server port
            const res = await axios.get("http://localhost:5000/api/workforce/holidays");
            setHolidays(res.data);
        } catch (error) {
            console.error("Failed to fetch holidays", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addHoliday = async (data, onSuccess) => {
        try {
            await axios.post("http://localhost:5000/api/workforce/holidays", data);
            await fetchHolidays(); // Refresh list
            if (onSuccess) onSuccess();
        } catch (error) {
            alert(error.response?.data?.message || "Error adding holiday");
        }
    };

    const removeHoliday = async (id) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/workforce/holidays/${id}`);
            setHolidays(prev => prev.filter(h => h._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    return { holidays, isLoading, addHoliday, removeHoliday };
};