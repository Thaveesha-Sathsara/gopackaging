import { Button } from "@/src/components/ui/button";
import { Form } from "@/src/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useEmployee } from "@/src/hooks/workforce/useEmployee";
import { createAlert } from "@/src/lib/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Camera, Save, X } from "lucide-react"; // Added Icons
import FormDatePicker from "@/src/components/FormDatePicker";
import FormDatePickerYearFirst from "@/src/components/FormDatePickerYearFirst";
import FormInputField from "@/src/components/FormInputField";
import FormSelector from "@/src/components/FormSelector";
import { compressImage } from "@/src/lib/imageHelper";

const formSchema = z.object({
    employeeID: z.string().min(1, "Required"),
    employeeName: z.string().min(1, "Required"),
    nic: z.string().min(1, "Required"),
    dob: z.coerce.date(),
    contactNumber: z.string().min(1, "Required"),
    address: z.string().min(1, "Required"),
    position: z.string().min(1, "Required"),
    joiningDate: z.coerce.date(),
    isActived: z.string().min(1, "Required"),
    remarks: z.string().optional(),
    salary: z.coerce.number().min(0, "Required"),
    allowanceMeal: z.coerce.number().min(0),
    allowanceMedical: z.coerce.number().min(0),
    allowanceAttendance: z.coerce.number().min(0),
    fixedAdvanceAmount: z.coerce.number().min(0),
    rateOT: z.coerce.number().min(0),
    rateDoubleOT: z.coerce.number().min(0),
    etfRate: z.coerce.number().min(0).max(100),
});

const CreateEmployee = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const path = `/workforce/employee`;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const { createEmployee, employees, isLoading } = useEmployee();
    
    const isActiveOptions = [ 
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
    ];
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employeeID: "", employeeName: "", nic: "", dob: null,
            contactNumber: "", address: "", position: "",
            joiningDate: null, remarks: "", isActived: "Active",
            salary: 0, allowanceMeal: 0, allowanceMedical: 0, allowanceAttendance: 0, fixedAdvanceAmount: 0,
            rateOT: 0, rateDoubleOT: 0, etfRate: 3,
        },
    });

    useEffect(() => {
        if (isLoading && !location.state?.employees) { 
            form.setValue("employeeID", "Generating..."); 
            return; 
        }
        const employeesList = employees || location.state?.employees || [];
        
        try {
            const empPrefix = "GPE-";
            if (!employeesList || employeesList.length === 0) {
                form.setValue("employeeID", `${empPrefix}0001`);
                return;
            }
            const sortedEmployees = [...employeesList].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            const latestEmployee = sortedEmployees[0];
            const latestEmpNumber = latestEmployee?.employeeID?.split(empPrefix).pop();
            if (!latestEmpNumber || isNaN(parseInt(latestEmpNumber, 10))) {
                form.setValue("employeeID", `${empPrefix}0001`);
                return;
            }
            const increment = (val) => String(parseInt(val, 10) + 1).padStart(4, "0");
            const empNumber = increment(latestEmpNumber);
            form.setValue("employeeID", `${empPrefix}${empNumber}`);
        } catch (error) {
            console.log("Error generating ID", error);
        }
    }, [form, location.state, employees, isLoading]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressedBase64 = await compressImage(file);
            setAvatarPreview(compressedBase64);
        }
    };

    const onSubmit = (data) => {
        setIsSubmitting(true);
        try {
            const employeeData = { 
                ...data,
                isActived: data.isActived === "Active",
                avatar: avatarPreview
            };
            createEmployee(employeeData);
            createAlert("Employee Added Successfully");
            navigate(path);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col w-full h-full p-6 bg-gray-50 min-h-screen">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 sticky top-0 bg-gra] z-10 pt-2">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Register Employee</h1>
                            <p className="text-gray-500 text-sm">Create a new profile</p>
                        </div>
                        <div className="flex gap-3">
                            <Link to={path}>
                                <Button variant="outline" type="button" className="gap-2">
                                    <X className="h-4 w-4" /> Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[140px]">
                                <Save className="h-4 w-4" />
                                {isSubmitting ? "Saving..." : "Save Profile"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-700">Identity</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col items-center gap-4 mb-4">
                                        <div className="h-32 w-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <Camera className="h-10 w-10 text-gray-400" />
                                            )}
                                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium">
                                                Change Photo
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                    </div>
                                    <FormInputField form={form} name="employeeID" label="Employee ID" readOnly />
                                    <FormInputField form={form} name="employeeName" label="Full Name" placeholder="Ex: John Doe" />
                                    <FormInputField form={form} name="nic" label="NIC Number" placeholder="National ID" />
                                    <FormDatePickerYearFirst form={form} name="dob" label="Date of Birth" fromYear={1960} />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-700">Employment Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormInputField form={form} name="position" label="Position" placeholder="Ex: Machine Operator" />
                                    <FormDatePicker form={form} name="joiningDate" label="Joining Date" fromYear={2000} />
                                    <FormSelector form={form} name="isActived" label="Employment Status" options={isActiveOptions} />
                                </CardContent>
                            </Card>

                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-700">Contact Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormInputField form={form} name="contactNumber" label="Phone Number" placeholder="Ex: 0771234567" />
                                    <FormInputField form={form} name="address" label="Residential Address" placeholder="No. 123, Street, City, Country" isTextarea />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-700">Benefits & Compensation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <FormInputField form={form} name="salary" label="Basic Hourly Rate (LKR)" type="number" />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInputField form={form} name="rateOT" label="OT Rate (Hr)" type="number" />
                                        <FormInputField form={form} name="rateDoubleOT" label="Double OT (Hr)" type="number" />
                                    </div>

                                    <div className="border-t border-gray-100 my-2"></div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Monthly Allowances</p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInputField form={form} name="allowanceMeal" label="Meal" type="number" />
                                        <FormInputField form={form} name="allowanceMedical" label="Medical" type="number" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInputField form={form} name="allowanceAttendance" label="Attendance Bonus" type="number" />
                                        <FormInputField form={form} name="fixedAdvanceAmount" label="Advance Payment" type="number" />
                                    </div>

                                    <div className="border-t border-gray-100 my-2"></div>
                                    <FormInputField form={form} name="etfRate" label="ETF/EPF Rate (%)" type="number" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default CreateEmployee;