import { Button } from "@/src/components/ui/button";
import { Form } from "@/src/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useEmployee } from "@/src/hooks/workforce/useEmployee"; // Real Hook
import { createAlert, errorAlert } from "@/src/lib/alert"; // Real Alert
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"; // Added useParams
import { z } from "zod";
import { 
    Camera, Save, X, Settings2, Plus, Clock, 
    ShieldAlert, Trash2, ChevronDown 
} from "lucide-react"; 

import FormDatePicker from "@/src/components/FormDatePicker";
import FormDatePickerYearFirst from "@/src/components/FormDatePickerYearFirst";
import FormInputField from "@/src/components/FormInputField";
import FormSelector from "@/src/components/FormSelector";
import { compressImage } from "@/src/lib/imageHelper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import axiosInstance from "@/src/services/axiosInstance";

// ✅ Standardized Schema (Same as Create Page)
const formSchema = z.object({
    employeeID: z.string().min(1, "Required"),
    employeeName: z.string().min(1, "Required"),
    nic: z.string().min(1, "Required"),
    dob: z.coerce.date(),
    contactNumber: z.string().min(1, "Required"),
    address: z.string().min(1, "Required"),
    
    role: z.string().min(1, "Role is required"), 
    
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

const EditEmployee = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL
    const path = `/workforce/employee`;
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    
    // ✅ Use the hook with ID to fetch specific employee
    const { patchEmployee, employee, isLoading } = useEmployee(id);
    
    // --- ROLE MANAGEMENT STATE ---
    const [roles, setRoles] = useState([]);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    
    // Form for creating a new role inside the dialog
    const [roleForm, setRoleForm] = useState({
        name: "",
        allowOvertime: true,
        allowDoubleOT: true,
        startTime: "08:00",
        endTime: "17:00"
    });

    const isActiveOptions = [ 
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
    ];
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employeeID: "", employeeName: "", nic: "", dob: null,
            contactNumber: "", address: "", 
            role: "", 
            joiningDate: null, remarks: "", isActived: "Active",
            salary: 0, allowanceMeal: 0, allowanceMedical: 0, allowanceAttendance: 0, fixedAdvanceAmount: 0,
            rateOT: 0, rateDoubleOT: 0, etfRate: 3,
        },
    });

    // 1. Fetch Roles from API
    const fetchRoles = async () => {
        try {
            const res = await axiosInstance.get('/api/workforce/job-roles');
            const formatted = res.data.map(r => ({ value: r._id, label: r.name, ...r }));
            setRoles(formatted);
        } catch (err) {
            console.error("Failed to fetch roles", err);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // 2. Load Employee Data into Form
    useEffect(() => {
        if (employee) {
            // Check if role is an object (populated) or string
            const roleId = typeof employee.role === 'object' ? employee.role._id : employee.role;

            form.reset({
                ...employee,
                role: roleId, 
                // Ensure dates are parsed correctly if strictly needed, 
                // but z.coerce.date usually handles ISO strings fine
                dob: new Date(employee.dob),
                joiningDate: new Date(employee.joiningDate),
                isActived: employee.isActived ? "Active" : "Inactive" // Handle boolean conversion if DB uses boolean
            });

            if (employee.avatar) {
                setAvatarPreview(employee.avatar);
            }
        }
    }, [employee, form]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressedBase64 = await compressImage(file);
            setAvatarPreview(compressedBase64);
        }
    };

    // 3. Create Role Logic (No Success Alert, just update)
    const handleCreateRole = async () => {
        if (!roleForm.name.trim()) return;
        try {
            const res = await axiosInstance.post('/api/workforce/job-roles', roleForm);
            
            await fetchRoles(); // Refresh dropdown
            form.setValue("role", res.data._id); // Auto-select new role
            
            // Reset Form
            setRoleForm({
                name: "",
                allowOvertime: true,
                allowDoubleOT: true,
                startTime: "08:00",
                endTime: "17:00"
            });
            // No alert, implied success by visual update
        } catch (err) {
            errorAlert("Failed to create role", err);
        }
    };

    const handleDeleteRole = async (roleId, roleName) => {
        if (!window.confirm(`Delete "${roleName}"?`)) return;
        try {
            await axiosInstance.delete(`/api/workforce/job-roles/${roleId}`);
            await fetchRoles();
            if (form.getValues("role") === roleId) form.setValue("role", "");
        } catch (err) {
            errorAlert("Failed to delete role", err);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const employeeData = { 
                ...data,
                isActived: data.isActived === "Active", // Convert back to boolean for DB
                avatar: avatarPreview
            };
            
            // ✅ Use patchEmployee instead of createEmployee
            await patchEmployee(employeeData); 
            
            createAlert("Employee Updated Successfully");
            navigate(path);
        } catch (error) {
            console.error(error);
            // Error is usually handled by the hook/interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center text-gray-500">Loading profile...</div>;
    }

    return (
        <div className="flex flex-col w-full h-full p-6 bg-gray-50 min-h-screen">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 sticky top-0 bg-gray-50 z-10 pt-2">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Edit Employee</h1>
                            <p className="text-gray-500 text-sm">Update employee details</p>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => navigate(path)} className="gap-2">
                                <X className="h-4 w-4" /> Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[140px]">
                                <Save className="h-4 w-4" />
                                {isSubmitting ? "Updating..." : "Update Profile"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Column 1: Identity */}
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
                                    {/* ReadOnly ID for Editing */}
                                    <FormInputField form={form} name="employeeID" label="Employee ID" readOnly className="bg-gray-100" />
                                    <FormInputField form={form} name="employeeName" label="Full Name" placeholder="Ex: John Doe" />
                                    <FormInputField form={form} name="nic" label="NIC Number" placeholder="National ID" />
                                    <FormDatePickerYearFirst form={form} name="dob" label="Date of Birth" fromYear={1960} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Column 2: Job Details */}
                        <div className="space-y-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-700">Employment Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    
                                    {/* ROLE SELECTOR WITH MANAGE BUTTON */}
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <FormSelector 
                                                form={form} 
                                                name="role" 
                                                label="Job Role / Position" 
                                                options={roles} 
                                                placeholder="Select a role..."
                                            />
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon" 
                                            className="mb-[2px] border-dashed border-gray-400 text-gray-600 hover:text-blue-600 hover:border-blue-600"
                                            onClick={() => setIsRoleDialogOpen(true)}
                                            title="Manage Roles"
                                        >
                                            <Settings2 className="h-4 w-4" />
                                        </Button>
                                    </div>

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

                        {/* Column 3: Compensation */}
                        <div className="space-y-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-700">Benefits & Compensation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormInputField form={form} name="salary" label="Basic Hourly Rate (LKR)" type="number" />
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

            {/* --- MANAGE JOB ROLES DIALOG --- */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Manage Job Roles</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 px-1 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
                        
                        {/* CREATE NEW ROLE */}
                        <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-dashed border-gray-300">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Plus className="h-4 w-4 text-blue-600" /> Create New Role
                            </h4>
                            
                            <div className="space-y-2">
                                <Label>Role Name</Label>
                                <Input 
                                    placeholder="Ex: Driver, Security Guard"
                                    value={roleForm.name}
                                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                    className="bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-xs text-gray-500"><Clock className="h-3 w-3"/> Shift Start</Label>
                                    <Input 
                                        type="time"
                                        value={roleForm.startTime}
                                        onChange={(e) => setRoleForm({ ...roleForm, startTime: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-xs text-gray-500"><Clock className="h-3 w-3"/> Shift End</Label>
                                    <Input 
                                        type="time"
                                        value={roleForm.endTime}
                                        onChange={(e) => setRoleForm({ ...roleForm, endTime: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <Checkbox 
                                        id="allowOT" 
                                        checked={roleForm.allowOvertime} 
                                        onCheckedChange={(val) => setRoleForm({ ...roleForm, allowOvertime: val })} 
                                    />
                                    <Label htmlFor="allowOT" className="cursor-pointer">Allow Normal OT</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox 
                                        id="allowDOT" 
                                        checked={roleForm.allowDoubleOT} 
                                        onCheckedChange={(val) => setRoleForm({ ...roleForm, allowDoubleOT: val })} 
                                    />
                                    <Label htmlFor="allowDOT" className="cursor-pointer flex items-center gap-2">
                                        Allow Double OT <ShieldAlert className="h-3 w-3 text-orange-500" />
                                    </Label>
                                </div>
                            </div>

                            <Button onClick={handleCreateRole} size="sm" className="w-full">Save New Role</Button>
                        </div>

                        {/* EXISTING ROLES LIST */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700">Existing Roles</h4>
                            <div className="border rounded-md divide-y overflow-hidden max-h-40 overflow-y-auto">
                                {roles.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">No roles found.</div>
                                ) : (
                                    roles.map((role) => (
                                        <div key={role.value} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{role.label}</p>
                                                <p className="text-xs text-gray-500">{role.startTime} - {role.endTime} • {role.allowOvertime ? "OT: Yes" : "OT: No"}</p>
                                            </div>
                                            <Button 
                                                type="button"
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteRole(role.value, role.label)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditEmployee;