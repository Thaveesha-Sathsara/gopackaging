import DataTableColumnHeader from "@/src/components/DataTableCoulmnHeader";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";


const Columns = (handleDelete) => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
        accessorKey: "nic",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Employee NIC" />
        ),
    },
    {
        accessorKey: "salary",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Salary" />
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("salary"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "LKR",
            }).format(amount)
            return <div className="text-right font-medium">{formatted}</div>
        }
    },
    {
        accessorKey: "position",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Position" />
        ),
    },
    {
        accessorKey: "isActived",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Active Status" />
        ),
        cell: ({ row }) => {
            return row.getValue("isActived") ? "Active" : "Inactive";
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const employee = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <Link to={`${employee._id}/edit`}>Edit employee</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`${employee._id}/view`}>View employee</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(employee._id)}>
                            Delete Employee
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default Columns;