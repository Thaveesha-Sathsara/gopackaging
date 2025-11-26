import React, { forwardRef } from "react";
import logoImage from "@/src/assets/logo.png";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

    const handleFormatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

// FORWARD REF IS REQUIRED FOR REACT-TO-PRINT
const Payslip = forwardRef(({ data, dateRange }, ref) => {
  if (!data) return null;

  const { employee, summary } = data;

  const monthName = dateRange.start.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

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
      {/* HEADER */}
      <div className="flex justify-between items-start border-b border-gray-700 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <img src={logoImage} className="h-16 w-16 object-contain" />

          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              LCS Enterprises
            </h1>
            <p className="text-sm text-gray-600">No. 12, Address</p>
            <p className="text-sm text-gray-600">+94 123 456 7890</p>
            <p className="text-sm text-gray-600">www.lcs-enterprise.com.lk</p>
          </div>
        </div>

        <div className="text-right mt-2">
          <h2 className="text-xl font-bold">PAYSLIP</h2>
          <p className="text-sm text-gray-600">{monthName}</p>
        </div>
      </div>

      {/* EMPLOYEE DETAILS */}
      <div className="grid grid-cols-2 gap-y-1 mb-8 text-[14px]">
        <div className="flex">
          <span className="font-semibold w-40">Employee Name:</span> {employee.name}
        </div>
        <div className="flex">
          <span className="font-semibold w-40">Designation:</span> {employee.position}
        </div>
        <div className="flex">
          <span className="font-semibold w-40">Employee NIC:</span> {employee.nic}
        </div>
        <div className="flex">
          <span className="font-semibold w-40">Joined Date:</span> {handleFormatDate(employee.joinedDate)}
        </div>
      </div>

      {/* EARNINGS */}
      <div className="mb-4">
              <h3 className="font-bold pb-1 mb-6">Monthly Salary Sheet: {monthName}</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-gray-300 text-black-600">
              <th className="py-1 text-left">Particulars</th>
              <th className="py-1 text-center">Hours</th>
              <th className="py-1 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2">Basic Salary</td>
              <td className="text-center">{summary.normalHours}</td>
              <td className="text-right">{formatCurrency(summary.totalActualBasicPay)}</td>
            </tr>

            <tr className="border-b border-gray-200">
              <td className="py-2">OT Salary</td>
              <td className="text-center">{summary.otHours}</td>
              <td className="text-right">{formatCurrency(summary.otPay)}</td>
            </tr>

            <tr className="border-b border-gray-200">
              <td className="py-2">Double OT</td>
              <td className="text-center">{summary.doubleOtHours}</td>
              <td className="text-right">{formatCurrency(summary.doubleOtPay)}</td>
            </tr>

            <tr className="font-bold">
              <td className="py-2">Total Earnings</td>
              <td></td>
              <td className="text-right">{formatCurrency(summary.totalWorkPay)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ALLOWANCES */}
      <div className="mb-6">

        <table className="w-full text-sm">
        <thead>
            <tr className="border-t border-b border-gray-300 text-black-600">
              <th className="py-1 text-left">Extra Allowances</th>
              <th className="py-1 text-right">Amount</th>
            </tr>
          </thead>
        
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2">Meal Allowance</td>
              <td className="text-right">
                {formatCurrency(summary.allowanceBreakdown.meal)}
              </td>
            </tr>

            <tr className="border-b border-gray-200">
              <td className="py-2">Medical Allowance</td>
              <td className="text-right">
                {formatCurrency(summary.allowanceBreakdown.medical)}
              </td>
            </tr>

            <tr className="border-b border-gray-200">
              <td className="py-2">Attendance Allowance</td>
              <td className="text-right">
                {formatCurrency(summary.allowanceBreakdown.attendance)}
              </td>
            </tr>
            
            <tr className="border-b border-gray-200">
              <td className="py-2">Advance Payment</td>
              <td className="text-right">
                {formatCurrency(summary.allowanceBreakdown.advance)}
              </td>
            </tr>
            
            <tr className="border-b border-gray-200">
              <td className="py-2">Special Bonus</td>
              <td className="text-right">
                {formatCurrency(summary.allowanceBreakdown.bonus)}
              </td>
            </tr>

            <tr className="font-bold">
              <td className="py-2">Total Allowances</td>
              <td className="text-right">{formatCurrency(summary.totalAllowances)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* DEDUCTIONS */}
      <div className="mb-10">
        <table className="w-full text-sm">
            <thead>
            <tr className="border-t border-b border-gray-300 text-black-600">
              <th className="py-1 text-left">Deductions</th>
              <th className="py-1 text-right">Amount</th>
            </tr>
            </thead>
                  
          <tbody>
            <tr className="border-b border-gray-200 text-red-600">
              <td className="py-2">Late Attendance</td>
              <td className="text-right">{formatCurrency(summary.totalLateDeductions)}</td>
            </tr>

            <tr className="font-bold bg-red-100 text-red-700">
              <td className="py-2">Total Deductions</td>
              <td className="text-right">
                {formatCurrency(summary.totalLateDeductions + summary.advanceDeduction)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* NET SALARY */}
      <div className="border-t border-gray-700 pt-3 mb-12">
        <div className="flex justify-between bg-gray-200 p-4 rounded text-lg font-bold">
          <span>NET SALARY PAYABLE</span>
          <span>{formatCurrency(summary.netPay)}</span>
        </div>
      </div>

      {/* SIGNATURES */}
      <div className="flex justify-between px-10 mt-15">
        <div className="text-center">
          <div className="border-t border-gray-700 w-40 mx-auto mb-1"></div>
          <p className="text-sm">{employee.name}</p>
          <p className="text-xs text-gray-500">Employee Signature</p>
        </div>

        <div className="text-center">
          <div className="border-t border-gray-700 w-40 mx-auto mb-1"></div>
          <p className="text-sm">Company Owner</p>
          <p className="text-xs text-gray-500">Authorized Signature</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-gray-500 mt-10">
        Generated by Workforce Management System • {new Date().toLocaleString()}
      </div>
    </div>
  );
});

export default Payslip;
