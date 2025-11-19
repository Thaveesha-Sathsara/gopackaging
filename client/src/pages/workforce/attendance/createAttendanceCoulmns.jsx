import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from "@/src/components/ui/input";

// A simple helper to parse HH:mm strings
const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

// The auto-calculation magic!
const calculateTotalHours = (startTime, endTime) => {
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    if (!start || !end || end <= start) {
        return 0; // Return 0 if invalid
    }

    const diffMs = end - start;
    const diffMinutes = diffMs / 1000 / 60;
    const totalHours = diffMinutes / 60;
    
    return parseFloat(totalHours.toFixed(2));
};

export const CreateAttendanceColumns = (watch, setValue) => [
    {
        accessorKey: "employeeID",
        header: "Employee ID",
    },
    {
        accessorKey: "employeeName",
        header: "Employee Name",
    },
    {
        accessorKey: "position",
        header: "Position",
    },
    {
        id: "startTime",
        header: "Start Time",
        cell: ({ row }) => {
            const index = row.index;
            const fieldName = `records.${index}.startTime`;
            
            return (
                <Controller
                    name={fieldName}
                    render={({ field }) => (
                        <Input 
                            {...field}
                            type="time"
                            className="w-32"
                        />
                    )}
                />
            );
        },
    },
    {
        id: "endTime",
        header: "End Time",
        cell: ({ row }) => {
            const index = row.index;
            const fieldName = `records.${index}.endTime`;

            return (
                <Controller
                    name={fieldName}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="time"
                            className="w-32"
                            onBlur={(e) => {
                                field.onBlur(e); // Important
                                const startTime = watch(`records.${index}.startTime`);
                                const endTime = e.target.value;
                                const totalHours = calculateTotalHours(startTime, endTime);
                                // Set the value in the hook-form state
                                setValue(`records.${index}.totalHours`, totalHours);
                            }}
                        />
                    )}
                />
            );
        },
    },
    {
        id: "totalHours",
        header: "Total Hours",
        cell: ({ row }) => {
            const index = row.index;
            // Watch the value from the form
            const totalHours = watch(`records.${index}.totalHours`);
            return (
                <span className="font-medium">{totalHours}</span>
            );
        },
    },
];