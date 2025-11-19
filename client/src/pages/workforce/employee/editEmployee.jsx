import { Button } from "@/src/components/ui/button";
import {
    Form,
} from "@/src/components/ui/fomr";
import { useEmployee } from "@/src/hooks/workforce/useEmployee";
import { createAlert } from "@/src/lib/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import FormDatePicker from "@/src/components/FormDatePicker";
import FormInputField from "@/src/components/FormInputField";
import FormSelector from "@/src/components/FormSelector";

const formSchema = z.object({
    employeeID: z.string().min(1, { message: "Employee ID is required." }),
    employeeName: z.string().min(1, { message: "Employee name is required." }),
    nic: z.string().min(1, { message: "NIC is required." }),
    dob: z.coerce.date().max(new Date(), { message: "Date of birth must be in the past." }),
    contactNumber: z.string().min(1, { message: "Contact number is required." }),
    address: z.string().min(1, { message: "Address is required." }),
    position: z.string().min(1, { message: "Position is required." }),
    salary: z.coerce.number().min(0, { message: "Salary must be a positive number." }),
    joiningDate: z.coerce.date(),
    remarks: z.string().optional(),
    isActived: z.string().optional(),
});

const EditEmployee = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const path = `/workforce/employee`;
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { employee, isLoading, patchEmployee } = useEmployee(id);
    
    const isActiveOptions = [ 
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
     ];
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employeeID: "",
            employeeName: "",
            nic: "",
            dob: null,
            contactNumber: "",
            address: "",
            position: "",
            salary: 0,
            joiningDate: null,
            remarks: "",
            isActived: "Active",
        },
    });

    // Populate the form once the employee data is loaded
    useEffect(() => {
        if (employee) {
            form.setValue("employeeID", employee.employeeID);
            form.setValue("employeeName", employee.employeeName);
            form.setValue("nic", employee.nic);
            form.setValue("dob", new Date(employee.dob));
            form.setValue("contactNumber", employee.contactNumber);
            form.setValue("address", employee.address);
            form.setValue("position", employee.position);
            form.setValue("salary", employee.salary);
            form.setValue("joiningDate", new Date(employee.joiningDate));
            form.setValue("remarks", employee.remarks || "");
            form.setValue("isActived", employee.isActived ? "Active" : "Inactive");
        }
    }, [employee, form]);

    const onSubmit = (data) => {
        setIsSubmitting(true);
        try {
            const employeeData = { 
                ...data,
                isActived: data.isActived === "Active" 
            };
            
            patchEmployee(employeeData);

            createAlert("Employee Updated.");
            navigate(path);
        } catch (error) {
            console.error("Error updating employee:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div>Loading employee data...</div>;
    }

    return (
        <div className="flex flex-col w-full h-full p-6">
            <h1 className="text-2xl font-semibold mb-4">Edit Employee</h1>
            <h2 className="text-lg text-gray-500 mb-4">{employee?.employeeName} ({employee?.employeeID})</h2>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((data) => onSubmit(data))}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInputField
                            form={form}
                            name="employeeID"
                            label="Employee ID"
                            readOnly
                        />
                        <FormInputField
                            form={form}
                            name="employeeName"
                            label="Employee Name"
                            placeholder=" Enter Employee Full Name"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInputField
                            form={form}
                            name="nic"
                            label="National Identity Card Number"
                            placeholder=" Enter NIC Number"
                            required
                        />
                        <FormDatePicker
                            form={form}
                            name="dob"
                            label="Date of Birth"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInputField
                            form={form}
                            name="contactNumber"
                            label="Contact Number"
                            placeholder=" Enter Contact Number"
                            required
                        />
                        <FormInputField
                            form={form}
                            name="address"
                            label="Address"
                            placeholder=" Enter Address"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormInputField
                            form={form}
                            name="position"
                            label="Position"
                            placeholder=" Enter Position"
                            required
                        />
                        <FormInputField
                            form={form}
                            name="salary"
                            type="number"
                            label="Salary"
                            placeholder=" Enter Salary"
                            required
                        />
                        <FormDatePicker
                            form={form}
                            name="joiningDate"
                            label="Start Date"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelector
                            form={form}
                            name="isActived"
                            label="Status"
                            placeholder="Select the Status"
                            options={isActiveOptions}
                            required
                        />
                        <FormInputField
                            form={form}
                            name="remarks"
                            label="Remarks"
                            placeholder=" Enter Remarks"
                            isTextarea
                        />
                    </div>

                    <div className="flex justify-start gap-4 pb-6">
                        <Button type="submit" disabled={isSubmitting}>
                            Save Changes
                        </Button>
                        <Link to={path}>
                            <Button variant={"destructive"}>Cancel</Button>
                        </Link>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default EditEmployee;