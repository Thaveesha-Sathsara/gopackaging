import { Button } from "@/src/components/ui/button";
import {
    Form,
} from "@/src/components/ui/fomr";
import { useEmployee } from "@/src/hooks/workforce/useEmployee";
import { createAlert } from "@/src/lib/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

const CreateEmployee = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const path = `/workforce/employee`;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createEmployee, employees, isLoading } = useEmployee();
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
            isActived: "Active", // Default to string "Active" for the selector
        },
    });

    useEffect(() => {
    if (isLoading && !location.state?.employees) {
        form.setValue("employeeID", "Generating...");
        return;
    }

    const employeesList = employees || location.state?.employees || [];

    const createEmployeeNumbers = () => {
        try {
            const empPrefix = "GPE-";
            
            // Handle the case for the very first employee
            if (!employeesList || employeesList.length === 0) {
                form.setValue("employeeID", `${empPrefix}0001`);
                return;
            }

            //    Sort by createdAt date (newest first)
            const sortedEmployees = [...employeesList].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            const latestEmployee = sortedEmployees[0];
            
            // Check if the latest employee has a valid ID
            if (!latestEmployee || !latestEmployee.employeeID) {
                console.error("Latest employee has no employeeID. Defaulting to 0001.");
                form.setValue("employeeID", `${empPrefix}0001`);
                return; 
            }

            const latestEmpNumber = latestEmployee.employeeID.split(empPrefix).pop();

            // Check if the number extracted is valid
            if (!latestEmpNumber || isNaN(parseInt(latestEmpNumber, 10))) {
                console.error("Could not parse latest employee number. Defaulting to 0001.");
                form.setValue("employeeID", `${empPrefix}0001`);
                return;
            }

            const increment = (val) => String(parseInt(val, 10) + 1).padStart(4, "0");
            const empNumber = increment(latestEmpNumber);
            
            form.setValue("employeeID", `${empPrefix}${empNumber}`);

        } catch (error) {
            console.log("Error creating employee number:", error);
            form.setValue("employeeID", "Error!");
        }
    };

    createEmployeeNumbers();

  }, [form, location.state, employees, isLoading]);

    const onSubmit = (data) => {
        setIsSubmitting(true);

        try {
            const employeeData = { 
                ...data,
                isActived: data.isActived === "Active" 
            };

            createEmployee(employeeData);

            createAlert("Employee Added.");
            navigate(path);
        } catch (error) {
            console.error("Error creating employee:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col w-full h-full p-6">
            <h1 className="text-2xl font-semibold mb-4">Add Employee</h1>

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
                            placeholder="Employee ID"
                            readOnly
                            required
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
                            fromYear={1900}
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
                            fromYear={2000}
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
                            Add New Employee
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

export default CreateEmployee;