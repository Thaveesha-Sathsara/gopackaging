import React, { useState } from "react";
import DataTable from "@/src/components/DataTable";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { DateRangePicker } from "@/src/components/ui/date-range-picker"; 
import { usePayroll } from "@/src/hooks/workforce/usePayroll";
import { PayrollColumns } from "./PayrollColumns"; // We create this next

const Payroll = () => {
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Default to 1st of month
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    });

    const { payrollSummary, isLoadingSummary } = usePayroll(dateRange.from, dateRange.to);


    const handleDateRangeChange = (range) => {
        if (range?.from) setDateRange(range);
    };

    return (
        <div className="p-6 h-full flex flex-col gap-6 bg-gray-50/50">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text 2x1 font-bold text-gray-900">Payroll Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage payroll records.</p>
                </div>

                <div className="flex items-center gap-3">

                    <DateRangePicker 
                        date={dateRange}
                        onDateChange={handleDateRangeChange}
                    /> 

                </div>
            </div>
            <ScrollArea>
                    <DataTable
                        columns={PayrollColumns(dateRange)}
                        data={payrollSummary || []}
                        emptyMessage="No payroll records found for this period."
                        isLoading={isLoadingSummary}
                    />
            </ScrollArea>
        </div>
    );
};

export default Payroll;