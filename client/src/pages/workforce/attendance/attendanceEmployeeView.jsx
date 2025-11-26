import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAttendance } from '@/src/hooks/workforce/useAttendance';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import DataTable from "@/src/components/DataTable";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, CalendarDays, Clock, AlertTriangle } from "lucide-react";

// Helper: Calculate actual duration (End - Start)
const calculateActualDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    
    const startDecimal = sh + sm / 60;
    const endDecimal = eh + em / 60;
    
    let diff = endDecimal - startDecimal;
    if (diff < 0) diff = 0; // Handle errors
    
    return diff.toFixed(2);
};

// Helper: Calculate Late Hours (Time past 8:00 AM)
const getLateDuration = (startTime) => {
    if (!startTime) return 0;
    const [h, m] = startTime.split(':').map(Number);
    const arrivalTime = h + m / 60;
    const workStartTime = 8.0; // 8:00 AM

    if (arrivalTime > workStartTime) {
        const diff = arrivalTime - workStartTime;
        return diff.toFixed(2);
    }
    return 0;
};

const AttendanceEmployeeView = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Parse dates from URL
    const startDate = new Date(searchParams.get("from") || new Date());
    const endDate = new Date(searchParams.get("to") || new Date());

    const { employeeHistory, isLoadingHistory } = useAttendance(startDate, endDate, null, id);

    if (isLoadingHistory) return <div className="p-10">Loading history...</div>;
    if (!employeeHistory) return <div className="p-10">No records found.</div>;

    const { employee, records } = employeeHistory;

    // --- Stats ---
    const totalDays = records.length;
    // Sum of 'normalHours' (Payroll Hours)
    const totalPayrollHours = records.reduce((sum, rec) => sum + (rec.normalHours || 0), 0);
    const avgHours = totalDays > 0 ? (totalPayrollHours / totalDays).toFixed(1) : 0;

    const columns = [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                const date = new Date(row.getValue("date"));
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{date.toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500">{date.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "startTime",
            header: "Start Time",
            cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("startTime")}</div>
        },
        {
            accessorKey: "endTime",
            header: "End Time",
            cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("endTime")}</div>
        },
        {
            // ✅ NEW: Actual Duration (End - Start)
            id: "actualDuration",
            header: "Duration",
            cell: ({ row }) => {
                const start = row.getValue("startTime");
                const end = row.getValue("endTime");
                const duration = calculateActualDuration(start, end);
                return <div className="text-gray-600 text-xs">{duration} Hrs</div>;
            }
        },
        {
            // ✅ NEW: Late Arrivals (Red Warning)
            id: "lateArrival",
            header: "Late Arrivals",
            cell: ({ row }) => {
                const start = row.getValue("startTime");
                const lateHours = getLateDuration(start);
                
                if (lateHours > 0) {
                    return (
                        <div className="flex items-center gap-1 text-red-600 font-bold text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            {lateHours} hrs
                        </div>
                    );
                }
                return <span className="text-gray-500 text-xs">-</span>;
            }
        },
        {
            // ✅ UPDATED: Total Hours (Mapped to normalHours for Payroll)
            accessorKey: "normalHours",
            header: "Payroll Hours",
            cell: ({ row }) => {
                const record = row.original;
                
                if (record.status === "Leave") {
                     return <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">On Leave</span>;
                }

                const hours = row.getValue("normalHours");
                
                // Highlight green if they got full hours, orange if penalized
                return (
                    <div className={`font-bold ${hours < 8 ? "text-orange-600" : "text-green-600"}`}>
                        {hours ? hours.toFixed(2) : 0} Hrs
                    </div>
                );
            }
        },
    ];

    return (
        <div className="p-6 flex flex-col gap-6 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{employee.name}</h1>
                        <p className="text-gray-500">{employee.id} • {employee.position}</p>
                    </div>
                </div>
                <div className="text-sm text-gray-500 text-right">
                    Report Period:<br/>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Total Days Present</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDays} Days</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Total Payroll Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPayrollHours.toFixed(2)} Hrs</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Avg. Hours / Day</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgHours} Hrs</div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-none shadow-none bg-transparent">
                 <DataTable 
                    columns={columns} 
                    data={records} 
                    title="Detailed Attendance History"
                    emptyMessage="No attendance records found for this period."
                />
            </Card>
        </div>
    );
};

export default AttendanceEmployeeView;