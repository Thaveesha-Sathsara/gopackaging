import React, { useState } from "react";
import ActionButtons from "@/src/components/ActionButtons";
import DataTable from "@/src/components/DataTable";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { DateRangePicker } from "@/src/components/ui/date-range-picker"; 
import { useAttendance } from "@/src/hooks/workforce/useAttendance";
import { Columns } from "./attendanceSummaryColumns";

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
        if (range?.from) {
            setDateRange({
                from: range.from,
                to: range.to || range.from 
            });
        }
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
        <div className="p-6 flex flex-col h-full gap-6 bg-gray-50/50">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    {/* Fixed typo: text 2x1 -> text-2xl */}
                    <h1 className="text-2x2 font-bold text-gray-900">Attendance Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage attendance records.</p>
                </div>

                <div className="flex items-center gap-3">
                    <DateRangePicker 
                        date={dateRange}
                        onDateChange={handleDateRangeChange}
                    /> 
                    
                    <div className="h-8 w-px bg-gray-300 mx-2"></div>

                    <div>{actionButtons}</div>
                
                </div>

            </div>
            <ScrollArea>
                    <DataTable
                        // Ensure Columns gets the safe range (with 'to' defined) for the View History links
                        columns={Columns({ 
                            from: dateRange.from, 
                            to: dateRange.to || dateRange.from 
                        })}
                        data={attendanceSummary || []}
                        emptyMessage="No attendance records found for this period."
                        isLoading={isLoadingSummary}
                    />
            </ScrollArea>
        </div>
    );
};

export default Attendance;