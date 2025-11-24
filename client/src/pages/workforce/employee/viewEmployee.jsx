import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEmployee } from '@/src/hooks/workforce/useEmployee';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
    MoreVertical,
    User,
    Hash,
    CalendarDays,
    ContactRound,
    Phone,
    MapPin,
    Briefcase,
    DollarSign,
    CheckCircle,
    XCircle,
    FileText,
    Pencil,
    ArrowLeft,
    Clock,
    Utensils,
    HeartPulse,
    CalendarCheck,
    Percent
} from "lucide-react";

const getInitials = (name = "") => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
};

const DetailRow = ({ icon, label, value }) => {
    const Icon = icon;
    return (
        <div className="flex items-center gap-3">
            <Icon className="text-blue-500 size-4 shrink-0" />
            <span className="font-semibold w-28 text-gray-700 dark:text-gray-200">
                {label}:
            </span>
            <span className="text-gray-600 dark:text-gray-400 break-words">
                {value || "N/A"}
            </span>
        </div>
    );
};

const ViewEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { employee, isLoading } = useEmployee(id);

    const handleFormatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleFormatCurrency = (amount) => {
        // Fix: Check for undefined/null explicitly, allow 0
        if (amount === undefined || amount === null) return "N/A";
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
        }).format(amount);
    };

    if (isLoading) {
        return <EmployeeViewSkeleton />;
    }

    if (!employee) {
        return (
            <div className="p-6">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h2 className="mt-4 text-2xl font-semibold">Employee not found.</h2>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6 h-full">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Profile Header */}
                <Card className="bg-white dark:bg-[#1e1e24] shadow-md rounded-2xl">
                    <CardContent className="flex items-center gap-4 p-6">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage src={employee.avatar} alt={employee.employeeName} />
                            <AvatarFallback className="rounded-lg text-black dark:text-gray-50">
                                {getInitials(employee.employeeName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-0.5">
                                {employee.employeeName}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">
                                {employee.position}
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="ml-auto">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link to={`/workforce/employee/${id}/edit`} className="flex items-center gap-2">
                                        <Pencil className="h-4 w-4" />
                                        <span>Edit Employee</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardContent>
                </Card>

                {/* Personal Details */}
                <Card className="bg-white dark:bg-[#1e1e24] shadow-md rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-gray-100 text-base">
                            Personal Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <DetailRow icon={ContactRound} label="NIC" value={employee.nic} />
                        <div className="border-t border-gray-300 dark:border-gray-700"></div>
                        <DetailRow icon={CalendarDays} label="Date of Birth" value={handleFormatDate(employee.dob)} />
                        <div className="border-t border-gray-300 dark:border-gray-700"></div>
                        <DetailRow icon={MapPin} label="Address" value={employee.address} />
                    </CardContent>
                </Card>

                {/* ✅ NEW COMPENSATION CARD (This was missing in your paste!) */}
                <Card className="bg-white dark:bg-[#1e1e24] shadow-md rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-gray-100 text-base flex items-center gap-2">
                            <DollarSign className="size-4 text-green-600" /> Compensation Package
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <DetailRow icon={Clock} label="Hourly Rate" value={handleFormatCurrency(employee.salary)} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                                <span className="block text-[10px] uppercase text-gray-500">OT Rate</span>
                                <span className="font-bold">{handleFormatCurrency(employee.rateOT)}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                                <span className="block text-[10px] uppercase text-gray-500">Double OT</span>
                                <span className="font-bold">{handleFormatCurrency(employee.rateDoubleOT)}</span>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-300 dark:border-gray-700"></div>
                        <p className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Allowances</p>
                        
                        <DetailRow icon={Utensils} label="Meal" value={handleFormatCurrency(employee.allowanceMeal)} />
                        <DetailRow icon={HeartPulse} label="Medical" value={handleFormatCurrency(employee.allowanceMedical)} />
                        <DetailRow icon={CalendarCheck} label="Attn. Bonus" value={handleFormatCurrency(employee.allowanceAttendance)} />
                        
                        <div className="border-t border-gray-300 dark:border-gray-700"></div>
                        <DetailRow icon={Percent} label="ETF Rate" value={`${employee.etfRate}%`} />
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Employment Details */}
                <Card className="bg-white dark:bg-[#1e1e24] shadow-md rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-gray-100 text-base">
                            Employment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <DetailRow icon={Hash} label="Employee ID" value={employee.employeeID} />
                        <div className="border-t border-gray-300 dark:border-gray-700"></div>
                        <DetailRow icon={Briefcase} label="Position" value={employee.position} />
                        <div className="border-t border-gray-300 dark:border-gray-700"></div>
                        <DetailRow icon={CalendarDays} label="Joining Date" value={handleFormatDate(employee.joiningDate)} />
                        <div className="border-t border-gray-300 dark:border-gray-700"></div>
                        <DetailRow 
                            icon={employee.isActived ? CheckCircle : XCircle} 
                            label="Status" 
                            value={employee.isActived ? "Active" : "Inactive"} 
                        />
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card className="bg-white dark:bg-[#1e1e24] shadow-md rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-gray-100 text-base">
                            Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <DetailRow icon={Phone} label="Contact No." value={employee.contactNumber} />
                    </CardContent>
                </Card>
            </div>
            
            {/* Remarks */}
            {employee.remarks && (
                <div className="lg:col-span-3">
                    <Card className="bg-white dark:bg-[#1e1e24] shadow-md rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-gray-800 dark:text-gray-100 text-base">
                                <FileText className="inline-block mr-2 h-4 w-4" /> Remarks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-600 dark:text-gray-400">
                            {employee.remarks}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

const EmployeeViewSkeleton = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6 h-full">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Card className="bg-white dark:bg-[#1e1e24] shadow-md rounded-2xl">
                    <CardContent className="flex items-center gap-4 p-6">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-[#1e1e24] shadow-md rounded-2xl">
                    <CardHeader>
                        <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
                <Card className="bg-white dark:bg-[#1e1e24] shadow-md rounded-2xl">
                    <CardHeader>
                        <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ViewEmployee;