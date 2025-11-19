import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { usePayroll } from '@/src/hooks/workforce/usePayroll';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import DataTable from "@/src/components/DataTable";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import DataTableColumnHeader from "@/src/components/DataTableCoulmnHeader";

const PayrollEmployeeView = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Get dates from URL or default to today
    const startDate = new Date(searchParams.get("from") || new Date());
    const endDate = new Date(searchParams.get("to") || new Date());

    const { employeePayroll, isLoadingEmployee } = usePayroll(startDate, endDate, id);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
    };

    const columns = [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString()
        },
        { accessorKey: "startTime", header: "Start" },
        { accessorKey: "endTime", header: "End" },
        { accessorKey: "totalHours", header: "Hours" },
        { 
            accessorKey: "dailyPay", 
            header: "Daily Pay",
            cell: ({ row }) => <div className="font-bold text-right">{formatCurrency(row.getValue("dailyPay"))}</div>
        },
    ];

    if (isLoadingEmployee) return <div className="p-10">Loading details...</div>;
    if (!employeePayroll) return <div className="p-10">No data found.</div>;

    const { employee, records } = employeePayroll;
    const totalPayForPeriod = records.reduce((sum, rec) => sum + rec.dailyPay, 0);

    return (
        <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{employee.name}</h1>
                        <p className="text-gray-500">{employee.id} - {employee.position}</p>
                    </div>
                </div>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" /> Print Payslip
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Hourly Rate</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{formatCurrency(employee.hourlyRate)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Hours</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{records.reduce((a, b) => a + b.totalHours, 0).toFixed(2)} hrs</div></CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Total Pay</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(totalPayForPeriod)}</div></CardContent>
                </Card>
            </div>

            {/* Detail Table */}
            <div className="bg-white dark:bg-[#1e1e24] rounded-lg shadow">
                <DataTable 
                    columns={columns} 
                    data={records} 
                    title={`Attendance Breakdown (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`}
                />
            </div>
        </div>
    );
};

export default PayrollEmployeeView;