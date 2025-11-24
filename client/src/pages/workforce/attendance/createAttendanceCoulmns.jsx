import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

// --- Helpers ---
const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

const calculateTotalHours = (startTime, endTime) => {
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    if (!start || !end || end <= start) {
        return 0;
    }
    const diffMs = end - start;
    const diffMinutes = diffMs / 1000 / 60;
    const totalHours = diffMinutes / 60;
    return parseFloat(totalHours.toFixed(2));
};

// --- 1. Status Cell Component ---
const StatusCell = ({ control, index, setValue }) => {
    return (
        <Controller
            control={control}
            name={`records.${index}.status`}
            render={({ field }) => (
                <Select 
                    onValueChange={(val) => {
                        field.onChange(val);
                        // Logic: If Leave is selected, clear and lock other fields
                        if (val === "Leave") {
                            setValue(`records.${index}.startTime`, "");
                            setValue(`records.${index}.endTime`, "");
                            setValue(`records.${index}.totalHours`, 0);
                        }
                    }} 
                    value={field.value}
                >
                    <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Present">Working</SelectItem>
                        <SelectItem value="Leave">On Leave</SelectItem>
                    </SelectContent>
                </Select>
            )}
        />
    );
};

// --- 2. Start Time Cell Component ---
const StartTimeCell = ({ control, index }) => {
    // ✅ Valid: Hook called inside a component
    const status = useWatch({
        control,
        name: `records.${index}.status`,
    });
    const isLeave = status === "Leave";

    return (
        <Controller
            control={control}
            name={`records.${index}.startTime`}
            render={({ field }) => (
                <Input 
                    {...field}
                    type="time"
                    disabled={isLeave}
                    className={`w-32 transition-colors ${isLeave ? "bg-gray-100 opacity-50 cursor-not-allowed" : ""}`}
                />
            )}
        />
    );
};

// --- 3. End Time Cell Component ---
const EndTimeCell = ({ control, index, setValue }) => {
    // ✅ Valid: Hooks called inside a component
    const status = useWatch({
        control,
        name: `records.${index}.status`,
    });
    const startTime = useWatch({
        control,
        name: `records.${index}.startTime`,
    });
    const isLeave = status === "Leave";

    return (
        <Controller
            control={control}
            name={`records.${index}.endTime`}
            render={({ field }) => (
                <Input
                    {...field}
                    type="time"
                    disabled={isLeave}
                    className={`w-32 transition-colors ${isLeave ? "bg-gray-100 opacity-50 cursor-not-allowed" : ""}`}
                    onBlur={(e) => {
                        field.onBlur(e);
                        // Calc logic
                        if (!isLeave && startTime && e.target.value) {
                            const totalHours = calculateTotalHours(startTime, e.target.value);
                            setValue(`records.${index}.totalHours`, totalHours);
                        }
                    }}
                />
            )}
        />
    );
};

// --- 4. Total Hours Cell Component ---
const TotalHoursCell = ({ control, index }) => {
    // ✅ Valid: Hooks called inside a component
    const totalHours = useWatch({
        control,
        name: `records.${index}.totalHours`
    });
    const status = useWatch({
        control,
        name: `records.${index}.status`,
    });

    if (status === "Leave") {
        // Replaced <Badge> with a simple Tailwind span
        return (
            <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                On Leave
            </span>
        );
    }

    return <span className="font-medium ml-2">{totalHours || 0}</span>;
};

// --- Main Columns Definition ---
export const CreateAttendanceColumns = (control, setValue) => [
    {
        accessorKey: "employeeID",
        header: "ID",
    },
    {
        accessorKey: "employeeName",
        header: "Name",
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
            <StatusCell control={control} index={row.index} setValue={setValue} />
        ),
    },
    {
        id: "startTime",
        header: "Start Time",
        cell: ({ row }) => (
            <StartTimeCell control={control} index={row.index} />
        ),
    },
    {
        id: "endTime",
        header: "End Time",
        cell: ({ row }) => (
            <EndTimeCell control={control} index={row.index} setValue={setValue} />
        ),
    },
    {
        id: "totalHours",
        header: "Total Hours",
        cell: ({ row }) => (
            <TotalHoursCell control={control} index={row.index} />
        ),
    },
];