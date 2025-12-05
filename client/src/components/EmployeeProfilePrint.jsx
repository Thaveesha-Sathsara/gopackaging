import React, { forwardRef } from "react";
import { 
    User, MapPin, Phone, Briefcase, CalendarDays, 
    CreditCard, Hash, Clock, DollarSign, CheckCircle, XCircle, FileText, Utensils
} from "lucide-react";
import logoImage from "@/src/assets/logo.png";

// Helper for formatting currency
const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(amount);
};

// Helper for formatting dates
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const EmployeeProfilePrint = forwardRef(({ employee }, ref) => {
    if (!employee) return null;

    return (
        <div
      ref={ref}
      id="printable-payslip"
      className="
        bg-white text-black 
        mx-auto 
        p-8 
        w-full max-w-[780px]
        font-[Times_New_Roman,serif]
      "
    >
            {/* --- CONTENT CONTAINER (Use min-h to fill space) --- */}
            <div className="flex flex-col" style={{ minHeight: '280mm' }}>
                
                {/* 1. HEADER - Company Letterhead */}
                <div className="flex justify-between items-start border-b border-gray-700 pb-4 mb-4 mt-6">
                        <div className="flex items-center gap-4">
                          <img src={logoImage} className="h-16 w-16 object-contain" />
                
                          <div>
                            <h1 className="text-2xl font-bold uppercase tracking-wide">
                              LCS Enterprises
                            </h1>
                            <h3 className="text-md font-bold">G.O Packaging</h3>
                          </div>
                        </div>
                
                        <div className="text-right mt-2">
                        <p className="text-sm text-gray-600">No. 1522, Ketakellagaha Watta Road,</p>
                        <p className="text-sm text-gray-600">Kottawa, Pannipitiya, Sri Lanka.</p>
                        <p className="text-sm text-gray-600">+94 (0)11 218-9691</p>
                        <p className="text-sm text-gray-600">www.lcs-enterprise.com.lk</p>
                        </div>
                      </div>

                {/* 2. DOCUMENT TITLE & PROFILE IMAGE */}
                <div className="flex items-start justify-between mb-6 pb-6 mt-6 border-b border-gray-400">
                    <div>
                        <h2 className="text-xl font-bold uppercase mb-1">
                            Employee Profile Report
                        </h2>
                        <p className="text-xs text-gray-500 italic">Generated Report • As of: {formatDate(new Date())}</p>
                    </div>
                    {employee.avatar && (
                        <img 
                            src={employee.avatar} 
                            alt="Profile" 
                            className="h-16 w-16 rounded-lg border border-gray-300 object-cover shadow-sm"
                        />
                    )}
                </div>

                {/* 3. MAIN GRID LAYOUT - Using 2 columns for better density */}
                <div className="grid grid-cols-2 gap-x-10 gap-y-6 flex-grow">
                    
                    {/* LEFT COLUMN: Identity, Employment, Contact */}
                    <div className="col-span-1 space-y-8">
                        
                        {/* A. Identity & Status */}
                        <div>
                            <SectionTitle icon={User} title="Personal & Identity" />
                            <div className="space-y-1 mt-3">
                                <InfoRow label="Employee Name" value={employee.employeeName} isBold />
                                <InfoRow label="Employee ID" value={employee.employeeID} isBold />
                                <InfoRow label="NIC Number" value={employee.nic} />
                                <InfoRow label="Date of Birth" value={formatDate(employee.dob)} />
                                <InfoRow 
                                    label="Status" 
                                    value={employee.isActived ? "Active" : "Inactive"} 
                                    valueClass={employee.isActived ? "text-green-700 font-bold" : "text-red-700 font-bold"}
                                />
                            </div>
                        </div>

                        {/* B. Employment Details */}
                        <div>
                            <SectionTitle icon={Briefcase} title="Employment Details" />
                            <div className="space-y-1 mt-3">
                                <InfoRow label="Designation" value={employee.position} isBold />
                                <InfoRow label="Date Joined" value={formatDate(employee.joiningDate)} />
                            </div>
                        </div>
                        
                        {/* C. Contact Details */}
                        <div>
                            <SectionTitle icon={Phone} title="Contact Information" />
                            <div className="space-y-1 mt-3">
                                <InfoRow label="Contact No." value={employee.contactNumber} isBold />
                                <InfoRow label="Address" value={employee.address} className="h-auto items-start" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Compensation, Allowances, Remarks */}
                    <div className="col-span-1 space-y-8">
                        
                        {/* D. Compensation */}
                        <div>
                            <SectionTitle icon={DollarSign} title="Compensation" />
                            <div className="space-y-1 mt-3">
                                <InfoRow label="Hourly Rate" value={formatCurrency(employee.salary)} isBold />
                                <InfoRow label="OT Rate (1.5x)" value={formatCurrency(employee.rateOT)} />
                                <InfoRow label="Double OT (2x)" value={formatCurrency(employee.rateDoubleOT)} />
                                <InfoRow label="ETF/EPF Rate" value={`${employee.etfRate}%`} isBold />
                            </div>
                        </div>

                        {/* E. Fixed Allowances (Boxed style kept horizontal) */}
                        <div>
                            <SectionTitle icon={CreditCard} title="Fixed Allowances" />
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <BoxInfo label="Meal Allowance" value={formatCurrency(employee.allowanceMeal)} />
                                <BoxInfo label="Medical Allowance" value={formatCurrency(employee.allowanceMedical)} />
                                <BoxInfo label="Attendance Bonus" value={formatCurrency(employee.allowanceAttendance)} />
                                <BoxInfo label="Fixed Advance" value={formatCurrency(employee.fixedAdvanceAmount)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SIGNATURES AND FOOTER (Pushed to bottom) */}
                <div className="pt-8 border-t border-gray-400">
                    <div className=" w-full px-8 mb-6 text-center">
                        <p>This report is system generated and does not require a physical signature.</p>
                    </div>

                    {/* FOOTER */}
                    <div className="text-center text-xs text-gray-500">
                        Generated by LCS Enterprises - G.O Packaging Workforce Management System • Confidential Document
                    </div>
                </div>
            </div>
        </div>
    );
});

// --- SUB-COMPONENTS ---

const SectionTitle = ({ title, icon: Icon, className = '' }) => (
    // Use a slightly darker gray background for headers to look formal
    <div className={`flex items-center gap-2 border-b-2 border-gray-800 bg-gray-100 p-1.5 ${className}`}>
        {Icon && <Icon className="size-3 text-gray-700" />}
        <h4 className="font-bold uppercase text-xs tracking-wider text-gray-800">{title}</h4>
    </div>
);

const InfoRow = ({ label, value, isBold = false, valueClass = "", className = "" }) => (
    <div className={`flex justify-between items-start py-1 border-b border-gray-200 ${className}`}>
        <span className="text-gray-600 w-1/2 text-xs">{label}</span>
        <span className={`text-right w-1/2 text-gray-900 text-xs ${isBold ? 'font-bold' : ''} ${valueClass}`}>
            {value}
        </span>
    </div>
);

const BoxInfo = ({ label, value }) => (
    <div className="border border-gray-300 p-2 text-center rounded bg-gray-50">
        <p className="text-[9px] uppercase text-gray-500 font-semibold mb-1">{label}</p>
        <p className="text-xs font-bold text-gray-800">{value}</p>
    </div>
);

export default EmployeeProfilePrint;