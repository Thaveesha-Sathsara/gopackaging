import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { usePayroll } from '@/src/hooks/workforce/usePayroll';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import DataTable from "@/src/components/DataTable";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Printer, Coins, AlertOctagon } from "lucide-react";
import Payslip from '@/src/components/Payslip';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

const PayrollEmployeeView = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const printRef = useRef(null);
    
    const startDate = new Date(searchParams.get("from") || new Date());
    const endDate = new Date(searchParams.get("to") || new Date());

    const { employeePayroll, isLoadingEmployee } = usePayroll(startDate, endDate, id);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);
    };

    const handlePrint = useReactToPrint({
        documentTitle: employeePayroll?.employee?.name 
            ? `${employeePayroll.employee.name}-Payslip` 
            : `Payslip`,
        contentRef: printRef,
    });

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
            accessorKey: "normalHours", 
            header: "Basic Hrs", 
            cell: ({ row }) => {
                const val = row.original.normalHours;
                return val > 0 ? <span className="text-gray-600">{val}</span> : <span className="text-gray-500 text-xs">-</span>;
            }
        },
        { 
            accessorKey: "otHours",     
            header: "OT Hrs", 
            cell: ({ row }) => {
                const ot = row.original.otHours;
                return ot > 0 ? <span className="font-bold text-blue-600">{ot}</span> : <span className="text-gray-500 text-xs">-</span>;
            }
        },
        {
            accessorKey: "doubleOtHours", 
            header: "2x OT Hrs", 
            cell: ({ row }) => {
                const doubleOt = row.original.doubleOtHours;
                return doubleOt > 0 ? <span className="font-bold text-purple-600">{doubleOt}</span> : <span className="text-gray-500 text-xs">-</span>;
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

                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Print Payslip
                </Button>

            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gray-50 border-gray-200">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Net Basic Pay</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-800">{formatCurrency(summary?.totalGrossBasicPay)}</div>
                        
                        {/* Show the calculation if there were deductions */}
                        {/* {summary?.totalLateDeductions > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                                <span className="line-through mr-1">{formatCurrency(summary?.totalGrossBasicPay)}</span>
                                <span className="text-red-500 font-medium">-{formatCurrency(summary?.totalLateDeductions)}</span>
                            </div>
                        )} */}
                    </CardContent>
                </Card>

                {/* Allowances Card */}
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Allowances</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{formatCurrency(summary?.totalAllowances)}</div>
                        <div className="grid grid-cols-5 gap-1 text-xs text-blue-600 mt-1">
                            {summary?.allowanceBreakdown.meal > 0 && (
                                <span className="block">Meal: {summary?.allowanceBreakdown?.meal > 0 ? "Yes" : "No"}</span>
                            )}
                            {summary?.allowanceBreakdown.medical > 0 && (
                                <span className="block">Med: {summary?.allowanceBreakdown?.medical > 0 ? "Yes" : "No"}</span>
                            )}
                            {summary?.allowanceBreakdown.attendance > 0 && (
                                <span className="block">Att: {summary?.allowanceBreakdown?.attendance > 0 ? "Yes" : "No"}</span>
                            )}
                            {summary?.allowanceBreakdown.advance > 0 && (
                                <span className="block">Adv: {summary?.allowanceBreakdown?.advance > 0 ? "Yes" : "No"}</span>
                            )}
                            {summary?.allowanceBreakdown.bonus > 0 && (
                                <span className="block">Bonus: {summary?.allowanceBreakdown?.bonus > 0 ? "Yes" : "No"}</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Deductions Card */}
                <Card className="bg-red-50 border-red-200">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Deductions</CardTitle></CardHeader>   
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">
                            {formatCurrency(summary?.totalLateDeductions + summary?.advanceDeduction + summary?.etfAmount)}
                        </div>
                        <div className="text-xs text-red-600/80 mt-1">
                            {summary?.totalLateDeductions > 0 && (
                                <span className="block">Late: {formatCurrency(summary?.totalLateDeductions)}</span>
                            )}
                            {summary?.etfAmount > 0 && (
                                <span className="block">ETF Deduction: {formatCurrency(summary?.etfAmount)}</span>
                            )}
                            {summary?.advanceDeduction > 0 && (
                                <span className="block">Adv. Repay: {formatCurrency(summary?.advanceDeduction)}</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                     <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Days Present</CardTitle></CardHeader>
                     <CardContent><div className="text-2xl font-bold">{summary?.daysPresent} Days</div></CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-700">Final Net Pay</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{formatCurrency(summary.netPay)}</div></CardContent>
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

            <div style={{ display: "none" }}>
                <div ref={printRef}>
                    <Payslip 
                        data={employeePayroll} 
                        dateRange={{ start: startDate, end: endDate }} 
                    />
                </div>
            </div>

        </div>
    );
};

export default PayrollEmployeeView;