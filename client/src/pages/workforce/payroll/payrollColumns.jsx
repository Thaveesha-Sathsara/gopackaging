import DataTableColumnHeader from "@/src/components/DataTableCoulmnHeader";
import { Button } from "@/src/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);
};

export const PayrollColumns = (dateRange) => [
    {
        accessorKey: "employeeID",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Emp ID" />,
    },
    {
        accessorKey: "employeeName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
        accessorKey: "totalHours",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Hours" />,
        cell: ({ row }) => {
             // 🛠️ FIX: Ensure we parse the string to a number first
             const val = row.getValue("totalHours");
             const hours = parseFloat(val); 
             
             // Check if it's a valid number, otherwise show 0.00
             return <span className="font-medium">{!isNaN(hours) ? hours.toFixed(2) : "0.00"}</span>;
        }
    },
    {
        accessorKey: "hourlyRate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hourly Rate" />,
        cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("hourlyRate"))}</div>
    },
    {
        accessorKey: "totalPay", 
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Pay" />,
        cell: ({ row }) => {
            const pay = row.getValue("totalPay") || 0; 
            return <span className="font-bold">{formatCurrency(pay)}</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.employeeId;
            // Handle date range safely
            const fromStr = dateRange?.from ? dateRange.from.toISOString() : new Date().toISOString();
            const toStr = dateRange?.to ? dateRange.to.toISOString() : new Date().toISOString();
            
            const query = `?from=${fromStr}&to=${toStr}`;
            
            return (
                <Link to={`/workforce/payroll/employee/${id}${query}`}>
                    <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" /> View Details
                    </Button>
                </Link>
            );
        },
    },
];