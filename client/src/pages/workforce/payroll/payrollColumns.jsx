import DataTableColumnHeader from "@/src/components/DataTableCoulmnHeader";
import { Button } from "@/src/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
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
        cell: ({ row }) => <div className="text-center font-medium">{row.getValue("totalHours").toFixed(2)}</div>
    },
    {
        accessorKey: "hourlyRate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hourly Rate" />,
        cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("hourlyRate"))}</div>
    },
    {
        accessorKey: "totalPay",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Pay" />,
        cell: ({ row }) => <div className="text-right font-bold text-green-600">{formatCurrency(row.getValue("totalPay"))}</div>
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.employeeId;
            // Pass the current date range to the view page
            const query = `?from=${dateRange.from?.toISOString()}&to=${dateRange.to?.toISOString()}`;
            
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