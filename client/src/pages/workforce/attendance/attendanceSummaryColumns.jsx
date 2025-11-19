import DataTableColumnHeader from "@/src/components/DataTableCoulmnHeader";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/button";
import { Eye } from "lucide-react";

// This file exports an ARRAY directly, not a function
export const Columns = (dateRange) => [
    {
        accessorKey: "employeeID",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Employee ID" />
        ),
    },
    {
        accessorKey: "employeeName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Employee Name" />
        ),
    },
    {
        accessorKey: "position",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Position" />
        ),
    },
    {
        accessorKey: "totalHoursWorked",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Total Hours" />
        ),
        // Optional: Format the hours nicely
        cell: ({ row }) => {
            const hours = parseFloat(row.getValue("totalHoursWorked"))
            return <div className="font-medium">{hours.toFixed(2)} hours</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.employeeId;
            
            // Construct query string with current date range
            const from = dateRange?.from ? dateRange.from.toISOString() : new Date().toISOString();
            const to = dateRange?.to ? dateRange.to.toISOString() : new Date().toISOString();
            
            return (
                <Link to={`/workforce/attendance/employee/${id}?from=${from}&to=${to}`}>
                    <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" /> View History
                    </Button>
                </Link>
            );
        },
    },
];