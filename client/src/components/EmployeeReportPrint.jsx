import React from 'react';
// import logoImage from "@/src/assets/logo.png"; // Uncomment if you have the logo

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', { 
        style: 'currency', 
        currency: 'LKR',
        minimumFractionDigits: 2 
    }).format(amount || 0);
};

const EmployeeReportPrint = ({ data }) => {
    if (!data) return null;

    const { employee, history, stats } = data;

    return (
        <div 
            id="printable-employee-report" 
            className="bg-white text-black p-8 w-[210mm] h-auto font-serif relative mx-auto"
        >
            {/* --- HEADER --- */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                <div className="flex items-center gap-5">
                    {/* Logo Placeholder */}
                    <div className="h-20 w-20 bg-gray-100 border flex items-center justify-center font-bold text-gray-400">
                        LOGO
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold uppercase tracking-wide text-gray-900">LCS Enterprises</h1>
                        <p className="text-sm font-bold text-gray-600">Go Packaging - Workforce Analytics</p>
                    </div>
                </div>
                <div className="text-right text-sm text-gray-600 space-y-1">
                    <p className="font-bold text-gray-900">Generated Report</p>
                    <p>{new Date().toLocaleDateString()}</p>
                    <p>Confidential</p>
                </div>
            </div>

            {/* --- PROFILE SUMMARY --- */}
            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                <h3 className="font-bold text-sm uppercase text-gray-500 mb-4 border-b border-gray-300 pb-1">Employee Profile</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex"><span className="font-bold w-32 text-gray-700">Name:</span><span>{employee.employeeName}</span></div>
                    <div className="flex"><span className="font-bold w-32 text-gray-700">Employee ID:</span><span>{employee.employeeID}</span></div>
                    <div className="flex"><span className="font-bold w-32 text-gray-700">Designation:</span><span>{employee.position}</span></div>
                    <div className="flex"><span className="font-bold w-32 text-gray-700">Joined Date:</span><span>{new Date(employee.joiningDate).toLocaleDateString()}</span></div>
                    <div className="flex"><span className="font-bold w-32 text-gray-700">Mobile:</span><span>{employee.mobileNumber || "N/A"}</span></div>
                    <div className="flex"><span className="font-bold w-32 text-gray-700">Address:</span><span className="truncate w-64">{employee.address || "N/A"}</span></div>
                </div>
            </div>

            {/* --- KEY PERFORMANCE INDICATORS --- */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="border border-gray-300 p-4 text-center rounded-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">6-Month Avg. Hours</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stats.hours} <span className="text-sm font-normal text-gray-500">hrs/mo</span></p>
                </div>
                <div className="border border-gray-300 p-4 text-center rounded-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Month Earnings</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(stats.earnings)}</p>
                </div>
            </div>

            {/* --- DETAILED HISTORY TABLE --- */}
            <div className="mb-8">
                <h3 className="font-bold text-sm uppercase text-gray-500 mb-3">Performance History (Last 6 Months)</h3>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="py-3 px-3 text-left">Month</th>
                            <th className="py-3 px-3 text-center">Attendance</th>
                            <th className="py-3 px-3 text-center">Total Hours</th>
                            <th className="py-3 px-3 text-right">Basic Pay</th>
                            <th className="py-3 px-3 text-right">OT Pay</th>
                            <th className="py-3 px-3 text-right font-bold">Net Earning</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((month, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-3 px-3 font-medium">{month.name} {new Date(month.fullDate).getFullYear()}</td>
                                <td className="py-3 px-3 text-center">
                                    <span className="font-bold">{month.present}</span> Days
                                    {month.late > 0 && <span className="text-xs text-gray-500 block">({month.late} Late)</span>}
                                </td>
                                <td className="py-3 px-3 text-center">{month.hours.toFixed(1)}</td>
                                <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(month.earnings - month.otEarnings)}</td>
                                <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(month.otEarnings)}</td>
                                <td className="py-3 px-3 text-right font-bold text-black">{formatCurrency(month.earnings)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- FOOTER --- */}
            <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-400 pt-8 border-t border-gray-100">
                <p>This report is system generated and does not require a physical signature.</p>
                <p>LCS Enterprises • Workforce Management System</p>
            </div>
        </div>
    );
};

export default EmployeeReportPrint;