import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAttendance } from '@/src/hooks/workforce/useAttendance';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import DataTable from "@/src/components/DataTable";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, CalendarDays, Clock, AlertTriangle } from "lucide-react";

// ✅ FIX 1: Calculate actual duration handling midnight (e.g. 20:00 -> 05:00)
const calculateActualDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    
    const startDecimal = sh + sm / 60;
    let endDecimal = eh + em / 60;
    
    // Handle Next Day
    if (endDecimal < startDecimal) {
        endDecimal += 24;
    }
    
    return (endDecimal - startDecimal).toFixed(2);
};

// ✅ FIX 2: Detect Day vs Night Shift for "Late" calc
const getLateDuration = (startTime) => {
    if (!startTime) return 0;
    const [h, m] = startTime.split(':').map(Number);
    const arrivalTime = h + m / 60;

    // --- LOGIC ---
    // If arrival is AFTER 12:00 PM (12.0), assume Night Shift (Target: 20:00 / 8 PM)
    // If arrival is BEFORE 12:00 PM, assume Day Shift (Target: 08:00 / 8 AM)
    let workStartTime = 8.0; 

    if (arrivalTime >= 12.0) {
        workStartTime = 20.0; // 8:00 PM
    }

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
            // Actual Duration (End - Start)
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
            // Late Arrivals (Red Warning)
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
            // UPDATED: Total Hours (Mapped to normalHours for Payroll)
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
        <div className="p-6 flex flex-col gap-6 h-full bg-gray-50/50">
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
                    <span className="font-medium text-gray-900">
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
            
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-gray-900">Attendance History</h1>
                    <p className="text-sm text-gray-500">Detailed daily attendance records.</p>
                </div>
            
                <Card className="border-none shadow-none bg-transparent flex-1 overflow-hidden">
                     <DataTable 
                        columns={columns} 
                        data={records} 
                        emptyMessage="No attendance records found for this period."
                    />
                </Card>
            </div>
                
        </div>
    );
};

export default AttendanceEmployeeView;