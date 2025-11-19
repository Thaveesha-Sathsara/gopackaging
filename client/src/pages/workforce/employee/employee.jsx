import React from "react";
import ActionButtons from "@/src/components/ActionButtons";
import DataTable from "@/src/components/DataTable";
import { ScrollArea } from "@/src/components/ui/scroll-area";
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
        <div className="py-6 h-full flex flex-col">
            <ScrollArea>
                <div className="px-6 mt-3 max-w-screen-lg min-w-full">
                    <DataTable
                        columns={Columns(handleDelete)}
                        data={employees || []}
                        actionButtons={actionButtons}
                        title="Employees"
                        initialPageSize={20}
                        emptyMessage="No results."
                        isLoading={isLoading}
                    />
                </div>
            </ScrollArea>
        </div>
    );
};

export default Employee;