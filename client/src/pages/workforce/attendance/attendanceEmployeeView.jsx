import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAttendance } from '@/src/hooks/workforce/useAttendance';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import DataTable from "@/src/components/DataTable";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

const AttendanceEmployeeView = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Parse dates from URL
    const startDate = new Date(searchParams.get("from") || new Date());
    const endDate = new Date(searchParams.get("to") || new Date());

    // Use the updated hook
    const { employeeHistory, isLoadingHistory } = useAttendance(startDate, endDate, null, id);

    if (isLoadingHistory) return <div className="p-10">Loading history...</div>;
    if (!employeeHistory) return <div className="p-10">No records found.</div>;

    const { employee, records } = employeeHistory;

    // --- 🧠 Two Brains Logic: Calculate Stats ---
    const totalDays = records.length;
    const totalHours = records.reduce((sum, rec) => sum + (rec.totalHours || 0), 0);
    const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;

    // Define columns locally for simplicity
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
            accessorKey: "totalHours",
            header: "Duration",
            cell: ({ row }) => {
                const hours = row.getValue("totalHours");
                // Visual Cue: Red if under 8 hours, Green if over 8
                const colorClass = hours < 8 ? "text-orange-600" : "text-green-600";
                return (
                    <div className={`font-bold ${colorClass}`}>
                        {hours.toFixed(2)} Hours
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
                        <CardTitle className="text-sm font-medium">Total Hours Worked</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalHours.toFixed(2)} Hrs</div>
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