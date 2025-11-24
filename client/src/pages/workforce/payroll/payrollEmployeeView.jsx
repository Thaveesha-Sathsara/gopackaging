import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { usePayroll } from '@/src/hooks/workforce/usePayroll';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import DataTable from "@/src/components/DataTable";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Printer, Coins } from "lucide-react";

const PayrollEmployeeView = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const startDate = new Date(searchParams.get("from") || new Date());
    const endDate = new Date(searchParams.get("to") || new Date());

    const { employeePayroll, isLoadingEmployee } = usePayroll(startDate, endDate, id);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);
    };

    const columns = [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString()
        },
        { 
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                if (row.original.status === "Leave") return <span className="text-orange-600 font-bold text-xs">Leave</span>;
                return <span className="text-green-600 font-bold text-xs">Present</span>;
            }
        },
        { 
            accessorKey: "times", 
            header: "Time In/Out",
            cell: ({ row }) => {
                 if (row.original.status === "Leave") return "-";
                 return <div className="text-xs">{row.original.startTime} - {row.original.endTime}</div>
            }
        },
        // --- NEW COLUMNS FOR OT BREAKDOWN ---
        { 
            accessorKey: "normalHours", 
            header: "Basic Hrs", 
            cell: ({ row }) => <span className="text-gray-600">{row.original.normalHours}</span>
        },
        // {
        //     accessorKey: "normalPay",
        //     header: "Basic Pay",
        //     cell: ({ row }) => {
        //         const pay = row.original.normalPay;
        //         return pay > 0 ? <span className="text-xs text-gray-700">{formatCurrency(pay)}</span> : "-";
        //     }
        // },
        { 
            accessorKey: "otHours",     
            header: "OT Hrs", 
            cell: ({ row }) => {
                const ot = row.original.otHours;
                return ot > 0 ? <span className="font-bold text-blue-600">{ot}</span> : <span className="text-gray-300">-</span>;
            }
        },
        // { 
        //     accessorKey: "otPay", 
        //     header: "OT Pay", 
        //     cell: ({ row }) => {
        //         const pay = row.original.otPay;
        //         return pay > 0 ? <span className="text-xs text-blue-600">{formatCurrency(pay)}</span> : "-";
        //     }
        // },
        {
            accessorKey: "doubleOtHours", 
            header: "2x OT Hrs", 
            cell: ({ row }) => {
                const doubleOtHours = row.original.doubleOtHours;
                return doubleOtHours > 0 ? <span className="font-bold text-blue-600">{doubleOtHours}</span> : <span className="text-gray-300">-</span>;
            }
        },
        { 
            accessorKey: "dailyPay", 
            header: "Total Daily",
            cell: ({ row }) => <div className="font-bold text-right">{formatCurrency(row.getValue("dailyPay"))}</div>
        },
    ];

    if (isLoadingEmployee) return <div className="p-10">Loading details...</div>;
    if (!employeePayroll) return <div className="p-10">No data found.</div>;

    const { employee, records, summary } = employeePayroll;
    
    // Recalculate totals from records
    const totalWorkPay = records.reduce((sum, rec) => sum + (rec.dailyPay || 0), 0);
    const finalPayout = totalWorkPay + (summary?.totalAllowances || 0);

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

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Work Pay</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{formatCurrency(totalWorkPay)}</div></CardContent>
                </Card>
                
                {/* Allowances Card */}
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-blue-700">Total Allowances</CardTitle>
                        <Coins className="h-4 w-4 text-blue-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{formatCurrency(summary?.totalAllowances)}</div>
                        <div className="text-xs text-blue-600 mt-1">
                            Meal: {summary?.allowanceBreakdown?.meal > 0 ? "Yes" : "No"} | 
                            Med: {summary?.allowanceBreakdown?.medical > 0 ? "Yes" : "No"} | 
                            Attn: {summary?.allowanceBreakdown?.attendance > 0 ? "Yes" : "No"}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                     <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Days Present</CardTitle></CardHeader>
                     <CardContent><div className="text-2xl font-bold">{summary?.daysPresent} Days</div></CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-700">Final Net Pay</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{formatCurrency(finalPayout)}</div></CardContent>
                </Card>
            </div>

            {/* Detail Table */}
            <div className="bg-white rounded-lg shadow border">
                <DataTable 
                    columns={columns} 
                    data={records} 
                    title={`Payroll Breakdown (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`}
                />
            </div>
        </div>
    );
};

export default PayrollEmployeeView;