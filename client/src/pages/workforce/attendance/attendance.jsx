import React, { useState } from "react";
import ActionButtons from "@/src/components/ActionButtons";
import DataTable from "@/src/components/DataTable";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { DateRangePicker } from "@/src/components/ui/date-range-picker"; 
import { useAttendance } from "@/src/hooks/workforce/useAttendance";
import { CreateAttendanceColumns } from "./createAttendanceCoulmns";
import { Columns } from "./AttendanceSummaryColumns";

const Attendance = () => {
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    });

    const { attendanceSummary, isLoadingSummary } = useAttendance(
        dateRange.from, 
        dateRange.to
    );
    

    const handleDateRangeChange = (range) => {
        if (range?.from) setDateRange(range);
    };

    const actionButtons = (
        <ActionButtons
            buttons={[
                {
                    to: "/workforce/attendance/create",
                    label: "Add Daily Attendance",
                },
            ]}
        />
    );

    return (
        <div className="py-6 h-full flex flex-col">
            <ScrollArea>
                <div className="px-6 mt-3 max-w-screen-lg min-w-full">
                    <DateRangePicker 
                        date={dateRange}
                        onDateChange={handleDateRangeChange}
                    /> 
                    
                    <DataTable
                        columns={Columns(dateRange)}
                        data={attendanceSummary || []}
                        actionButtons={actionButtons}
                        title="Attendance Summary"
                        emptyMessage="No attendance records found for this period."
                        isLoading={isLoadingSummary}
                    />
                </div>
            </ScrollArea>
        </div>
    );
};

export default Attendance;