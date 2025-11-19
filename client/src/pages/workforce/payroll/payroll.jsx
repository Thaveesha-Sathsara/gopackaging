import React, { useState } from "react";
import DataTable from "@/src/components/DataTable";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { DateRangePicker } from "@/src/components/ui/date-range-picker"; 
import { usePayroll } from "@/src/hooks/workforce/usePayroll";
import { PayrollColumns } from "./PayrollColumns"; // We create this next

const Payroll = () => {
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Default to 1st of month
        to: new Date(),
    });

    const { payrollSummary, isLoadingSummary } = usePayroll(dateRange.from, dateRange.to);


    const handleDateRangeChange = (range) => {
        if (range?.from) setDateRange(range);
    };

    return (
        <div className="py-6 h-full flex flex-col">
            <ScrollArea>
                <div className="px-6 mt-3 max-w-screen-lg min-w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-semibold">Payroll Management</h1>
                        <DateRangePicker 
                            date={dateRange}
                            onDateChange={handleDateRangeChange}
                        /> 
                    </div>
                    
                    <DataTable
                        columns={PayrollColumns(dateRange)} // Pass dates to columns for the 'View' link
                        data={payrollSummary || []}
                        title="Payroll Summary"
                        emptyMessage="No payroll records found for this period."
                        isLoading={isLoadingSummary}
                    />
                </div>
            </ScrollArea>
        </div>
    );
};

export default Payroll;