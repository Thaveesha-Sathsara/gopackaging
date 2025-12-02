import React, { useState } from 'react';
import { useDashboard } from '@/src/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/src/components/ui/badge";
import { 
    Users, CalendarCheck, AlertTriangle, Package, 
    ArrowUpRight, Clock, DollarSign, Eye, EyeOff, CalendarDays
} from "lucide-react";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const Dashboard = () => {
    const { data, isLoading } = useDashboard();
    const [showFinance, setShowFinance] = useState(false); // PRIVACY MODE DEFAULT OFF

    if (isLoading) return <DashboardSkeleton />;

    const { stats, lists, charts } = data;

    // Helper to mask money
    const formatMoney = (amount) => {
        if (!showFinance) return "••••••";
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumSignificantDigits: 3 }).format(amount);
    };

    return (
        <div className="p-6 flex flex-col gap-6 bg-gray-50/50 dark:bg-black min-h-screen text-gray-900 dark:text-gray-100">
            
            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Overview of workforce performance and inventory health.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowFinance(!showFinance)}
                        title={showFinance ? "Hide Financials" : "Show Financials"}
                        className="dark:border-gray-700 dark:bg-gray-900"
                    >
                        {showFinance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Link to="/workforce/attendance/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-900/20">
                            <CalendarCheck className="h-4 w-4" /> Mark Attendance
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 2. KPI GRID (High Level Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Active Workforce" 
                    value={stats.totalEmployees} 
                    subValue={`${stats.presentToday} Present Today`}
                    icon={Users} 
                    color="text-blue-500" 
                    bg="bg-blue-50 dark:bg-blue-950/30"
                    trend={`${stats.attendanceRate}% Rate`}
                    trendColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard 
                    title="Total Man Hours (30d)" 
                    value={stats.totalManHours} 
                    subValue={`${stats.otHours} OT Hours`}
                    icon={Clock} 
                    color="text-purple-500" 
                    bg="bg-purple-50 dark:bg-purple-950/30"
                    trend="Efficiency Metric"
                    trendColor="text-gray-500"
                />
                <StatCard 
                    title="Est. Payroll Cost (30d)" 
                    value={formatMoney(stats.estimatedPayrollCost)} 
                    subValue="Includes OT & Allowances"
                    icon={DollarSign} 
                    color="text-emerald-500" 
                    bg="bg-emerald-50 dark:bg-emerald-950/30"
                    trend={showFinance ? "Tracked" : "Hidden"}
                    trendColor={showFinance ? "text-emerald-600" : "text-gray-400"}
                />
                <StatCard 
                    title="Inventory Alerts" 
                    value={stats.lowStockCount} 
                    subValue="Items below min level"
                    icon={AlertTriangle} 
                    color="text-red-500" 
                    bg="bg-red-50 dark:bg-red-950/30"
                    trend="Action Required"
                    trendColor="text-red-600 font-bold"
                />
            </div>

            {/* 3. CHARTING ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Financial Trend Chart */}
                <Card className="lg:col-span-2 shadow-sm border-gray-200 dark:border-gray-800 dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-lg">Payroll & OT Trend (6 Months)</CardTitle>
                        <CardDescription>Monthly expenditure breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        {showFinance ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts.payrollTrend}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorOt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px'}}
                                        itemStyle={{color: '#f3f4f6'}}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Pay" />
                                    <Area type="monotone" dataKey="ot" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorOt)" name="OT Cost" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                <EyeOff className="h-10 w-10 mb-2 opacity-50" />
                                <p>Financial data hidden</p>
                                <Button variant="link" onClick={() => setShowFinance(true)}>Reveal Data</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Holidays / Events */}
                <Card className="shadow-sm border-gray-200 dark:border-gray-800 dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-gray-500" /> Upcoming Events
                        </CardTitle>
                        <CardDescription>Upcoming holidays & non-working days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {lists.upcomingHolidays.length === 0 ? (
                                <p className="text-sm text-gray-500">No upcoming holidays.</p>
                            ) : (
                                lists.upcomingHolidays.map((holiday) => (
                                    <div key={holiday._id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border dark:border-zinc-700">
                                        <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 w-12 h-12 rounded-lg shadow-sm border dark:border-zinc-700">
                                            <span className="text-xs font-bold text-red-500 uppercase">
                                                {new Date(holiday.date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                                {new Date(holiday.date).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{holiday.name}</p>
                                            <Badge variant="secondary" className="mt-1 text-[10px] h-5">
                                                {holiday.type}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 4. BOTTOM ROW: Inventory Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 shadow-sm border-l-4 border-l-red-500 border-gray-200 dark:border-gray-800 dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                             <AlertTriangle className="h-5 w-5" /> Critical Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {lists.lowStockMaterials.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-green-600">
                                <Package className="h-8 w-8 mb-2 opacity-50" />
                                <p className="text-sm font-medium">Inventory is healthy</p>
                            </div>
                        ) : (
                            lists.lowStockMaterials.map(item => (
                                <div key={item._id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium dark:text-gray-300">{item.name}</span>
                                        <span className="text-red-600 dark:text-red-400 font-bold">{item.currentStock} / {item.minimumLevel} {item.unit}</span>
                                    </div>
                                    {/* Progress Bar Manual Implementation for simplicity */}
                                    <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-red-500" 
                                            style={{ width: `${Math.min((item.currentStock / item.minimumLevel) * 100, 100)}%` }} 
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                        <Link to="/inventory/raw-materials">
                            <Button variant="ghost" className="w-full text-xs text-gray-500 mt-2">View All Inventory</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Quick Actions (Using the previous logic but styled) */}
                <Card className="lg:col-span-2 shadow-sm border-gray-200 dark:border-gray-800 dark:bg-zinc-900">
                    <CardHeader><CardTitle className="text-lg">Quick Access</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickAction 
                            to="/workforce/employee/create" 
                            label="Add Employee" 
                            icon={Users} 
                            color="text-blue-600 dark:text-blue-400" 
                            bg="bg-blue-50 dark:bg-blue-900/20" 
                        />
                        <QuickAction 
                            to="/workforce/payroll" 
                            label="Process Payroll" 
                            icon={DollarSign} 
                            color="text-green-600 dark:text-green-400" 
                            bg="bg-green-50 dark:bg-green-900/20" 
                        />
                        <QuickAction 
                            to="/inventory/finished-goods" 
                            label="Production" 
                            icon={Package} 
                            color="text-purple-600 dark:text-purple-400" 
                            bg="bg-purple-50 dark:bg-purple-900/20" 
                        />
                         <QuickAction 
                            to="/inventory/raw-materials" 
                            label="Stock In/Out" 
                            icon={ArrowUpRight} 
                            color="text-orange-600 dark:text-orange-400" 
                            bg="bg-orange-50 dark:bg-orange-900/20" 
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// --- SUB COMPONENTS (Enterprise Styled) ---

const StatCard = ({ title, value, subValue, icon: Icon, color, bg, trend, trendColor }) => (
    <Card className="border-none shadow-sm dark:bg-zinc-900 overflow-hidden relative">
        <CardContent className="p-5">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</h3>
                    <p className="text-xs text-gray-400 mt-1">{subValue}</p>
                </div>
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
                <span className={`${trendColor} font-medium`}>{trend}</span>
            </div>
        </CardContent>
    </Card>
);

const QuickAction = ({ to, label, icon: Icon, color, bg }) => (
    <Link to={to} className="group">
        <div className={`flex flex-col items-center justify-center p-4 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer ${bg} bg-opacity-50 hover:bg-opacity-100`}>
            <Icon className={`h-6 w-6 mb-2 ${color}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{label}</span>
        </div>
    </Link>
);

const DashboardSkeleton = () => (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-black min-h-screen">
        <div className="flex justify-between"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-32" /></div>
        <div className="grid grid-cols-4 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
        <div className="grid grid-cols-3 gap-6 h-80"><Skeleton className="col-span-2 h-full" /><Skeleton className="col-span-1 h-full" /></div>
    </div>
);

export default Dashboard;