import React from "react";
import ActionButtons from "@/src/components/ActionButtons";
import DataTable from "@/src/components/DataTable";
import { useEmployee } from "@/src/hooks/workforce/useEmployee";
import { deleteAlert } from "@/src/lib/alert";
import  Columns  from "./columns";

const Employee = () => {
    const { employees, isLoading, deleteEmployee } = useEmployee();

    const handleDelete = (id) => {
        deleteAlert(
            "Are you sure?",
            `Your are about to delete a employee record. This action cannot be undone.`,
            "Yes, delete it!",
            `Employee record deleted successfully`,
            "Error deleting employee record.",
            () => deleteEmployee(id)
        );
    };

    const actionButtons = (
        <ActionButtons
            buttons={[
                {
                    to: "/workforce/employee/create",
                    label: "Add Employee",
                    state: { employees },
                },
            ]}
        />
    );

    return (
        <div className="p-6 flex flex-col h-full gap-6 bg-gray-50/50">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text 2x1 font-bold text-gray-900">Employee Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage employee records.</p>
                </div>
                    
                <div>{actionButtons}</div>

            </div>
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <DataTable
                    columns={Columns(handleDelete)}
                    data={employees || []}
                    initialPageSize={20}
                    emptyMessage="No results."
                    isLoading={isLoading}
                />
            </div>
            
        </div>
    );
};

export default Employee;