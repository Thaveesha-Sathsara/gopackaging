import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { 
    Download, User, MapPin, Phone, Mail, Briefcase, 
    Calendar, Clock, DollarSign
} from "lucide-react";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

// HOOKS
import { useEmployee } from "@/src/hooks/workforce/useEmployee"; 
import { useEmployeeReports } from "@/src/hooks/report/useEmployeeReport";

const EmployeeReports = () => {
    // 1. Get List of Employees for Dropdown
    const { employees } = useEmployee(); 

    const activeEmployees = employees?.filter(emp => emp.isActived === true) || [];
    
    const [selectedId, setSelectedId] = useState("");

    // 2. Fetch Report Data using React Query (Automatic loading/error states)
    const { data: reportData, isLoading: loading } = useEmployeeReports(selectedId);

    const formatCurrency = (val) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val);

    return (
        <div className="p-6 min-h-screen bg-gray-50/50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col gap-6">
            
            {/* TOP BAR */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Employee Analytics</h1>
                    <p className="text-muted-foreground text-sm">Individual performance and payroll history.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Select onValueChange={setSelectedId}>
                        <SelectTrigger className="w-[280px] bg-white dark:bg-zinc-900">
                            <SelectValue placeholder="Select Employee..." />
                        </SelectTrigger>
                        <SelectContent>
                            {activeEmployees?.map(emp => (
                                <SelectItem key={emp._id} value={emp._id}>{emp.employeeName} ({emp.employeeID})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* <Button variant="outline" disabled={!reportData}>
                        <Download className="h-4 w-4 mr-2" /> Export PDF
                    </Button> */}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            {!selectedId ? (
                <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <User className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">Select an employee to view their report</p>
                </div>
            ) : loading ? (
                 <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <div className="grid grid-cols-2 gap-4"><Skeleton className="h-60" /><Skeleton className="h-60" /></div>
                 </div>
            ) : reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT: PROFILE CARD */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
                            <CardHeader className="flex flex-col items-center pb-2">
                                <Avatar className="h-24 w-24 mb-4 border-4 border-gray-100 dark:border-zinc-800">
                                    <AvatarImage src={reportData.employee.avatar} />
                                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">{reportData.employee.employeeName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-xl">{reportData.employee.employeeName}</CardTitle>
                                <Badge variant="secondary" className="mt-2">{reportData.employee.position}</Badge>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <InfoRow icon={Briefcase} label="Employee ID" value={reportData.employee.employeeID} />
                                <InfoRow icon={Phone} label="Phone" value={reportData.employee.contactNumber} />
                                <InfoRow icon={Calendar} label="Joined" value={new Date(reportData.employee.joiningDate).toLocaleDateString()} />
                                <InfoRow icon={MapPin} label="Address" value={reportData.employee.address} />
                                <div className="pt-4 border-t dark:border-zinc-800">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Basic Salary</p>
                                            <p className="text-lg font-bold">{reportData.employee.salary?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">OT Rate</p>
                                            <p className="text-lg font-bold">{reportData.employee.rateOT}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary Stats Mini-Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <StatBox label="Avg. Monthly Hours" value={reportData.stats?.hours + "h"} icon={Clock} color="text-blue-500" />
                            <StatBox label="Last Month Pay" value={formatCurrency(reportData.stats?.earnings)} icon={DollarSign} color="text-green-500" />
                        </div>
                    </div>

                    {/* RIGHT: CHARTS */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* 1. EARNINGS HISTORY */}
                        <Card className="border-none shadow-sm dark:bg-zinc-900">
                            <CardHeader>
                                <CardTitle className="text-lg">Earnings History (6 Months)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={reportData.history}>
                                        <defs>
                                            <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                                        <Tooltip contentStyle={{backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none'}} />
                                        <Area type="monotone" dataKey="earnings" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPay)" strokeWidth={2} name="Total Pay" />
                                        <Area type="monotone" dataKey="otEarnings" stroke="#10b981" fillOpacity={0} strokeWidth={2} name="OT Pay" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 2. ATTENDANCE HEALTH */}
                            <Card className="border-none shadow-sm dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-lg">Attendance Health</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Present', value: reportData.history.reduce((a, b) => a + b.present, 0) },
                                                    { name: 'Late', value: reportData.history.reduce((a, b) => a + b.late, 0) },
                                                ]}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell key="cell-0" fill="#10b981" />
                                                <Cell key="cell-1" fill="#f59e0b" />
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* 3. HOURS WORKED */}
                            <Card className="border-none shadow-sm dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-lg">Work Intensity</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.history}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px'}} />
                                            <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Hours" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components
const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 text-sm">
        <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-md">
            <Icon className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex-1">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{value || "-"}</p>
        </div>
    </div>
);

const StatBox = ({ label, value, icon: Icon, color }) => (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
        <Icon className={`h-6 w-6 mb-2 ${color}`} />
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
    </div>
);

export default EmployeeReports;