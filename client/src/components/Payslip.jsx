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
      <div className="flex justify-between items-start border-b border-gray-400 pb-4 mb-4">
        <div className="flex items-center gap-4">
          <img src={logoImage} className="h-16 w-16 object-contain" />

          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              LCS Enterprises
            </h1>
            <h3 className="text-md font-bold">Go Packaging</h3>
          </div>
        </div>

        <div className="text-right mt-2">
        <p className="text-sm text-gray-600">No. 1522, Ketakellagaha Watta Road,</p>
        <p className="text-sm text-gray-600">Kottawa, Pannipitiya, Sri Lanka.</p>
        <p className="text-sm text-gray-600">+94 (0)11 218-9691</p>
        <p className="text-sm text-gray-600">www.lcs-enterprise.com.lk</p>
        </div>
      </div>

      {/* EMPLOYEE DETAILS */}
      <div className="grid grid-cols-2 gap-y-1 mb-4 text-[14px]  border-b border-gray-400 pb-4 text-gray-600">
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
          
          <h3 className="font-bold pb-1 mb-4">Monthly Salary Sheet: {monthName}</h3>

      {/* EARNINGS */}
      <div className="mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-gray-400 text-black-600">
              <th className="py-1 text-left">Particulars</th>
              <th className="py-1 text-center">Hours</th>
              <th className="py-1 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr className={`border-b border-gray-300 ${summary.totalActualBasicPay > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">Basic Salary</td>
              <td className="text-center">{summary.normalHours}</td>
              <td className="text-right">{formatCurrency(summary.totalActualBasicPay)}</td>
            </tr>

            <tr className={`border-b border-gray-300 ${summary.otPay > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">OT Salary</td>
              <td className="text-center">{summary.otHours}</td>
              <td className="text-right">{formatCurrency(summary.otPay)}</td>
            </tr>

            <tr className={`border-b border-gray-300 ${summary.doubleOtPay > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">Double OT Salary</td>
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
            <tr className="border-t border-b border-gray-400 text-black-600">
              <th className="py-1 text-left">Extra Allowances</th>
              <th className="py-1 text-right">Amount</th>
            </tr>
          </thead>
        
          <tbody>
            <tr className={`border-b border-gray-300 ${summary.allowanceBreakdown.meal > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">Meal Allowance</td>
              <td className="text-right">{formatCurrency(summary.allowanceBreakdown.meal)}</td>
            </tr>

            <tr className={`border-b border-gray-300 ${summary.allowanceBreakdown.medical > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">Medical Allowance</td>
              <td className="text-right">{formatCurrency(summary.allowanceBreakdown.medical)}</td>
            </tr>

            <tr className={`border-b border-gray-300 ${summary.allowanceBreakdown.attendance > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">Attendance Allowance</td>
              <td className="text-right">{formatCurrency(summary.allowanceBreakdown.attendance)}</td>
            </tr>
            
            <tr className={`border-b border-gray-300 ${summary.allowanceBreakdown.advance > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">Advance Payment</td>
              <td className="text-right">{formatCurrency(summary.allowanceBreakdown.advance)}</td>
            </tr>
            
            <tr className={`border-b border-gray-300 ${summary.allowanceBreakdown.bonus > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">Bonus</td>
              <td className="text-right">{formatCurrency(summary.allowanceBreakdown.bonus)}</td>
            </tr>

            <tr className="font-bold">
              <td className="py-2">Total Allowances</td>
              <td className="text-right">{formatCurrency(summary.totalAllowances)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* DEDUCTIONS */}
      <div className="mb-6">
        <table className="w-full text-sm">
            <thead>
            <tr className="border-t border-b border-gray-400 text-black-600">
              <th className="py-1 text-left">Deductions</th>
              <th className="py-1 text-right">Amount</th>
            </tr>
            </thead>
                  
          <tbody>
            <tr className={`border-b border-gray-300 ${summary.totalLateDeductions > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">Late Deductions</td>
              <td className="text-right">{formatCurrency(summary.totalLateDeductions)}</td>
            </tr>
            
            <tr className={`border-b border-gray-300 ${summary.etfAmount > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">ETF Deductions</td>
              <td className="text-right">{formatCurrency(summary.etfAmount)}</td>
            </tr>

            <tr className={`border-b border-gray-300 ${summary.advanceDeduction > 0 ? "text-black" : "text-gray-400"}`}>
              <td className="py-2">Advance Payment Repay</td>
              <td className="text-right">{formatCurrency(summary.advanceDeduction)}</td>
            </tr>

            <tr className="font-bold text-md">
              <td className="py-2">Total Deductions</td>
              <td className="text-right">
                {formatCurrency(summary.totalLateDeductions + summary.advanceDeduction + summary.etfAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* NET SALARY */}
      <div className="mb-14">
        <div className="flex justify-between text-lg font-bold">
          <span>NET SALARY</span>
          <span>{formatCurrency(summary.netPay)}</span>
        </div>
      </div>

      {/* SIGNATURES */}
      <div className="flex justify-between px-10 mt-15">
        <div className="text-center">
          <div className="border-t border-gray-700 w-40 mx-auto mb-1"></div>
          <p className="text-md">{employee.name}</p>
          <p className="text-sm text-gray-500">Employee Signature</p>
        </div>

        <div className="text-center">
          <div className="border-t border-gray-700 w-40 mx-auto mb-1"></div>
          <p className="text-md">Company Owner</p>
          <p className="text-sm text-gray-500">Authorized Signature</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-gray-500 mt-5">
        Generated by Workforce Management System • {new Date().toLocaleString()}
      </div>
    </div>
  );
});

export default Payslip;







// import React, { forwardRef } from "react";
// import logoImage from "@/src/assets/logo.png";

// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat("en-LK", {
//     style: "currency",
//     currency: "LKR",
//     minimumFractionDigits: 2,
//   }).format(amount || 0);
// };

//     const handleFormatDate = (dateString) => {
//         if (!dateString) return "N/A";
//         return new Date(dateString).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//         });
//     };

// // FORWARD REF IS REQUIRED FOR REACT-TO-PRINT
// const Payslip = forwardRef(({ data, dateRange }, ref) => {
//   if (!data) return null;

//   const { employee, summary } = data;

//   const monthName = dateRange.start.toLocaleString("default", {
//     month: "long",
//     year: "numeric",
//   });

//   return (
//     <div
//       ref={ref}
//       id="printable-payslip"
//       className="
//         bg-white text-black 
//         mx-auto 
//         p-8 
//         w-full max-w-[780px]
//         font-[Times_New_Roman,serif]
//       "
//     >
//       {/* HEADER */}
//       <div className="flex justify-between items-start border-b border-gray-700 pb-4 mb-4">
//         <div className="flex items-center gap-4">
//           <img src={logoImage} className="h-16 w-16 object-contain" />

//           <div>
//             <h1 className="text-2xl font-bold uppercase tracking-wide">
//               LCS Enterprises
//             </h1>
//             <h3 className="text-md font-bold">Go Packaging</h3>
//           </div>
//         </div>

//         <div className="text-right mt-2">
//         <p className="text-sm text-gray-600">No. 12, Address</p>
//         <p className="text-sm text-gray-600">+94 123 456 7890</p>
//         <p className="text-sm text-gray-600">www.lcs-enterprise.com.lk</p>
//         </div>
//       </div>

//       {/* EMPLOYEE DETAILS */}
//       <div className="grid grid-cols-2 gap-y-1 mb-4 text-[14px]  border-b border-gray-700 pb-4">
//         <div className="flex">
//           <span className="font-semibold w-40">Employee Name:</span> {employee.name}
//         </div>
//         <div className="flex">
//           <span className="font-semibold w-40">Designation:</span> {employee.position}
//         </div>
//         <div className="flex">
//           <span className="font-semibold w-40">Employee NIC:</span> {employee.nic}
//         </div>
//         <div className="flex">
//           <span className="font-semibold w-40">Joined Date:</span> {handleFormatDate(employee.joinedDate)}
//         </div>
//         </div>
          
//           <h3 className="font-bold pb-1 mb-4">Monthly Salary Sheet: {monthName}</h3>

//       {/* EARNINGS */}
//       <div className="mb-4">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-t border-b border-gray-600 text-black-600">
//               <th className="py-1 text-left">Particulars</th>
//               <th className="py-1 text-center">Hours</th>
//               <th className="py-1 text-right">Amount</th>
//             </tr>
//           </thead>

//           <tbody>
//             {summary.totalActualBasicPay > 0 && (
//                 <tr className="border-b border-gray-300">
//                     <td className="py-2">Basic Salary</td>
//                     <td className="text-center">{summary.normalHours}</td>
//                     <td className="text-right">{formatCurrency(summary.totalActualBasicPay)}</td>
//                 </tr>
//             )}

//             {summary.otPay > 0 && (
//                 <tr className="border-b border-gray-300">
//                     <td className="py-2">OT Salary</td>
//                     <td className="text-center">{summary.otHours}</td>
//                     <td className="text-right">{formatCurrency(summary.otPay)}</td>
//                 </tr>
//             )}

//             {summary.doubleOtPay > 0 && (
//                 <tr className="border-b border-gray-300">
//                     <td className="py-2">Double OT Salary</td>
//                     <td className="text-center">{summary.doubleOtHours}</td>
//                     <td className="text-right">{formatCurrency(summary.doubleOtPay)}</td>
//                 </tr>
//             )}

//             <tr className="font-bold">
//               <td className="py-2">Total Earnings</td>
//               <td></td>
//               <td className="text-right">{formatCurrency(summary.totalWorkPay)}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* ALLOWANCES */}
//       <div className="mb-6">

//         <table className="w-full text-sm">
//         <thead>
//             <tr className="border-t border-b border-gray-600 text-black-600">
//               <th className="py-1 text-left">Extra Allowances</th>
//               <th className="py-1 text-right">Amount</th>
//             </tr>
//           </thead>
        
//           <tbody>
//             {summary.allowanceBreakdown.meal > 0 && (
//                 <tr className="border-b border-gray-300">
//                     <td className="py-2">Meal Allowance</td>
//                     <td className="text-right">{formatCurrency(summary.allowanceBreakdown.meal)}</td>
//                 </tr>
//             )}

//             {summary.allowanceBreakdown.medical > 0 && (
//                 <tr className="border-b border-gray-300">
//                     <td className="py-2">Medical Allowance</td>
//                     <td className="text-right">{formatCurrency(summary.allowanceBreakdown.medical)}</td>
//                 </tr>
//             )}

//             {summary.allowanceBreakdown.attendance > 0 && (
//                 <tr className="border-b border-gray-300">
//                     <td className="py-2">Attendance Allowance</td>
//                     <td className="text-right">{formatCurrency(summary.allowanceBreakdown.attendance)}</td>
//                 </tr>
//             )}
            
//             <tr className={`border-b border-gray-300 ${summary.allowanceBreakdown.advance > 0 ? "text-black" : "text-gray-400"}`}>
//               <td className="py-2">Advance Payment</td>
//               <td className="text-right">{formatCurrency(summary.allowanceBreakdown.advance)}</td>
//             </tr>
            
//             {summary.allowanceBreakdown.bonus > 0 && (
//                 <tr className="border-b border-gray-300">
//                     <td className="py-2">Bonus</td>
//                     <td className="text-right">{formatCurrency(summary.allowanceBreakdown.bonus)}</td>
//                 </tr>
//             )}

//             <tr className="font-bold">
//               <td className="py-2">Total Allowances</td>
//               <td className="text-right">{formatCurrency(summary.totalAllowances)}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* DEDUCTIONS */}
//       <div className="mb-6">
//         <table className="w-full text-sm">
//             <thead>
//             <tr className="border-t border-b border-gray-600 text-black-600">
//               <th className="py-1 text-left">Deductions</th>
//               <th className="py-1 text-right">Amount</th>
//             </tr>
//             </thead>
                  
//           <tbody>
//               {summary.totalLateDeductions > 0 && (
//                 <tr className="border-b border-gray-300">
//                     <td className="py-2">Late Deductions</td>
//                     <td className="text-right">{formatCurrency(summary.totalLateDeductions)}</td>
//                 </tr>
//               )}
            
            
//             {summary.etfAmount > 0 && (
//                 <tr className="border-b border-gray-300">
//                     <td className="py-2">ETF Deduction</td>
//                     <td className="text-right">{formatCurrency(summary.etfAmount)}</td>
//                 </tr>
//             )}

//             {summary.advanceDeduction > 0 && (
//                 <tr className="border-b border-gray-300">
//                     <td className="py-2">Advance Payment Repay</td>
//                     <td className="text-right">{formatCurrency(summary.advanceDeduction)}</td>
//                 </tr>
//               )}

//             <tr className="font-bold">
//               <td className="py-2">Total Deductions</td>
//               <td className="text-right">
//                 {formatCurrency(summary.totalLateDeductions + summary.advanceDeduction + summary.etfAmount)}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* NET SALARY */}
//       <div className="mb-14">
//         <div className="flex justify-between text-lg font-bold">
//           <span>NET SALARY</span>
//           <span>{formatCurrency(summary.netPay)}</span>
//         </div>
//       </div>

//       {/* SIGNATURES */}
//       <div className="flex justify-between px-10 mt-15">
//         <div className="text-center">
//           <div className="border-t border-gray-700 w-40 mx-auto mb-1"></div>
//           <p className="text-md">{employee.name}</p>
//           <p className="text-sm text-gray-500">Employee Signature</p>
//         </div>

//         <div className="text-center">
//           <div className="border-t border-gray-700 w-40 mx-auto mb-1"></div>
//           <p className="text-md">Company Owner</p>
//           <p className="text-sm text-gray-500">Authorized Signature</p>
//         </div>
//       </div>

//       {/* FOOTER */}
//       <div className="text-center text-xs text-gray-500 mt-5">
//         Generated by Workforce Management System • {new Date().toLocaleString()}
//       </div>
//     </div>
//   );
// });

// export default Payslip;
