import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
    Camera, Save, X, Settings2, Plus, Clock, 
    ShieldAlert, Trash2, ChevronDown 
} from "lucide-react"; 

// ============================================================================
// 🛠️ MOCK UI COMPONENTS (Replace these with your real @/src/components imports if needed)
// ============================================================================

// --- 1. Mock Data & API (Simulating Backend) ---
const mockDb = {
    roles: [
        { _id: "r1", name: "Driver", startTime: "06:00", endTime: "18:00", allowOvertime: false, allowDoubleOT: false },
        { _id: "r2", name: "Machine Operator", startTime: "08:00", endTime: "17:00", allowOvertime: true, allowDoubleOT: true }
    ],
    employee: {
        employeeID: "GPE-0005",
        employeeName: "John Doe",
        nic: "981234567V",
        dob: "1998-05-15",
        contactNumber: "0771234567",
        address: "123, Main Street, Colombo",
        role: "r1", 
        joiningDate: "2023-01-10",
        isActived: "Active",
        salary: 450,
        allowanceMeal: 5000,
        allowanceMedical: 2500,
        allowanceAttendance: 1000,
        fixedAdvanceAmount: 0,
        rateOT: 675,
        rateDoubleOT: 900,
        etfRate: 3
    }
};

const axiosInstance = {
    get: async (url) => {
        await new Promise(r => setTimeout(r, 300));
        if (url === '/api/workforce/job-roles') return { data: [...mockDb.roles] };
        return { data: [] };
    },
    post: async (url, data) => {
        await new Promise(r => setTimeout(r, 300));
        if (url === '/api/workforce/job-roles') {
            const newRole = { _id: `r_${Date.now()}`, ...data };
            mockDb.roles.push(newRole);
            return { data: newRole };
        }
        return { data };
    },
    delete: async (url) => {
        await new Promise(r => setTimeout(r, 300));
        if (url.includes('job-roles')) {
            const id = url.split('/').pop();
            mockDb.roles = mockDb.roles.filter(r => r._id !== id);
            return { data: { message: "Deleted" } };
        }
    }
};

const useEmployee = (id) => {
    const [isLoading, setIsLoading] = useState(true);
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            setEmployee(mockDb.employee);
            setIsLoading(false);
        }, 500);
    }, [id]);

    return { 
        employee, 
        isLoading, 
        patchEmployee: (data) => new Promise(resolve => setTimeout(() => {
            console.log("Patched:", data);
            resolve(data);
        }, 500))
    };
};

const compressImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => resolve(e.target.result);
});

// --- 2. UI Components ---
const Button = ({ className, variant = "default", size = "default", children, ...props }) => {
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        destructive: "text-red-600 hover:bg-red-50 hover:text-red-700",
        ghost: "hover:bg-gray-100 text-gray-700",
        icon: "p-0 aspect-square flex items-center justify-center"
    };
    const sizes = { default: "h-10 px-4 py-2", sm: "h-9 px-3", icon: "h-10 w-10" };
    return <button type={props.type || "button"} className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

const Card = ({ children }) => <div className="rounded-xl border bg-white text-slate-950 shadow-sm">{children}</div>;
const CardHeader = ({ children }) => <div className="flex flex-col space-y-1.5 p-6 pb-2">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold leading-none tracking-tight">{children}</h3>;
const CardContent = ({ children }) => <div className="p-6 pt-0">{children}</div>;
const Label = ({ children, className }) => <label className={`text-sm font-medium leading-none ${className}`}>{children}</label>;
const Input = React.forwardRef(({ className, ...props }, ref) => (
    <input ref={ref} className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
));
const Checkbox = ({ id, checked, onCheckedChange }) => (
    <input type="checkbox" id={id} checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer accent-blue-600" />
);

// --- DIALOG COMPONENTS ---
const Dialog = ({ open, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                {children}
            </div>
        </div>
    );
};
const DialogContent = ({ children, className }) => <div className={`flex flex-col h-full ${className}`}>{children}</div>;
const DialogHeader = ({ children }) => <div className="px-6 py-4 border-b shrink-0">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>;
const DialogFooter = ({ children }) => <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 shrink-0">{children}</div>;

// --- Custom Form Fields ---
const FormInputField = ({ form, name, label, type = "text", placeholder, readOnly, isTextarea }) => {
    const { register, formState: { errors } } = form;
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {isTextarea ? (
                <textarea {...register(name)} className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50" placeholder={placeholder} readOnly={readOnly} />
            ) : (
                <Input {...register(name)} type={type} placeholder={placeholder} readOnly={readOnly} />
            )}
            {errors[name] && <p className="text-sm text-red-500">{errors[name]?.message}</p>}
        </div>
    );
};

const FormSelector = ({ form, name, label, options = [], placeholder }) => {
    const { control, formState: { errors } } = form;
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <div className="relative">
                        <select {...field} className="flex h-10 w-full appearance-none items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
                            <option value="" disabled hidden>{placeholder || "Select..."}</option>
                            {options.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                    </div>
                )}
            />
            {errors[name] && <p className="text-sm text-red-500">{errors[name]?.message}</p>}
        </div>
    );
};

const FormDatePicker = ({ form, name, label }) => {
    const { register, formState: { errors } } = form;
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input type="date" {...register(name)} />
            {errors[name] && <p className="text-sm text-red-500">{errors[name]?.message}</p>}
        </div>
    );
};

const FormDatePickerYearFirst = ({ form, name, label }) => {
    return <FormDatePicker form={form} name={name} label={label} />;
};

// --- Form Wrapper Component (Needed for hook form context if imported externally) ---
const Form = ({ children, ...props }) => <form {...props}>{children}</form>;


// ============================================================================
// 🚀 MAIN COMPONENT
// ============================================================================

const formSchema = z.object({
    employeeID: z.string().min(1, "Required"),
    employeeName: z.string().min(1, "Required"),
    nic: z.string().min(1, "Required"),
    dob: z.string().or(z.date()),
    contactNumber: z.string().min(1, "Required"),
    address: z.string().min(1, "Required"),
    
    role: z.string().min(1, "Role is required"), 
    
    joiningDate: z.string().or(z.date()),
    isActived: z.string().optional(),
    remarks: z.string().optional(),
    salary: z.coerce.number().min(0),
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
    const { id } = useParams();
    const path = `/workforce/employee`;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    
    // --- ROLE STATE ---
    const [roles, setRoles] = useState([]);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    
    const [roleForm, setRoleForm] = useState({
        name: "",
        allowOvertime: true,
        allowDoubleOT: true,
        startTime: "08:00",
        endTime: "17:00"
    });

    const { employee, isLoading, patchEmployee } = useEmployee(id);
    
    const isActiveOptions = [ { label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" } ];
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employeeID: "", employeeName: "", nic: "", dob: "",
            contactNumber: "", address: "", role: "", 
            joiningDate: "", remarks: "", isActived: "Active",
            salary: 0, allowanceMeal: 0, allowanceMedical: 0, allowanceAttendance: 0, fixedAdvanceAmount: 0,
            rateOT: 0, rateDoubleOT: 0, etfRate: 3,
        },
    });

    // --- ACTIONS ---

    const fetchRoles = async () => {
        try {
            const res = await axiosInstance.get('/api/workforce/job-roles');
            const formatted = res.data.map(r => ({ value: r._id, label: r.name, ...r }));
            setRoles(formatted);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchRoles(); }, []);

    // Load Data
    useEffect(() => {
        if (employee) {
            form.reset({
                ...employee,
                dob: employee.dob,
                joiningDate: employee.joiningDate,
                role: employee.role, // ID
                isActived: employee.isActived
            });
            if (employee.avatar) setAvatarPreview(employee.avatar);
        }
    }, [employee, form]);

    const handleCreateRole = async () => {
        if (!roleForm.name.trim()) return;
        try {
            const res = await axiosInstance.post('/api/workforce/job-roles', roleForm);
            
            // ✅ USING SIMPLE ALERT (Requested Fix)
            window.alert(`Role '${roleForm.name}' created!`);
            
            await fetchRoles();
            form.setValue("role", res.data._id); 
            
            setRoleForm({
                name: "",
                allowOvertime: true,
                allowDoubleOT: true,
                startTime: "08:00",
                endTime: "17:00"
            });
        } catch (err) { 
            window.alert("Failed to create role: " + err.message); 
        }
    };

    const handleDeleteRole = async (roleId, roleName) => {
        if (!window.confirm(`Delete "${roleName}"?`)) return;
        try {
            await axiosInstance.delete(`/api/workforce/job-roles/${roleId}`);
            window.alert("Role deleted.");
            await fetchRoles();
            if (form.getValues("role") === roleId) form.setValue("role", "");
        } catch (err) { 
            window.alert("Failed to delete: " + err.message); 
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressedBase64 = await compressImage(file);
            setAvatarPreview(compressedBase64);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const employeeData = { ...data, avatar: avatarPreview };
            await patchEmployee(employeeData);
            
            // ✅ USING SIMPLE ALERT (Requested Fix)
            window.alert("Employee Updated Successfully");
            setTimeout(() => navigate(path), 500);
        } catch (error) { 
            window.alert("Error updating employee"); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    if (isLoading) return <div className="p-10 flex justify-center text-gray-500">Loading Employee Data...</div>;

    return (
        <div className="flex flex-col w-full h-full p-6 bg-gray-50 min-h-screen relative">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 sticky top-0 bg-gray-50 z-10 pt-2">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Edit Employee</h1>
                            <p className="text-gray-500 text-sm">{employee?.employeeName} ({employee?.employeeID})</p>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="gap-2">
                                <X className="h-4 w-4" /> Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[140px]">
                                <Save className="h-4 w-4" />
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* COLUMN 1: Identity */}
                        <div className="space-y-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">Identity</CardTitle>
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
                                    <FormInputField form={form} name="employeeName" label="Full Name" />
                                    <FormInputField form={form} name="nic" label="NIC Number" />
                                    <FormDatePickerYearFirst form={form} name="dob" label="Date of Birth" fromYear={1960} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* COLUMN 2: Work (WITH ROLE MANAGER) */}
                        <div className="space-y-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">Employment Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <FormSelector form={form} name="role" label="Job Role / Position" options={roles} placeholder="Select a role..." />
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
                                    <FormDatePicker form={form} name="joiningDate" label="Joined Date" fromYear={2000} />
                                    <FormSelector form={form} name="isActived" label="Employment Status" options={isActiveOptions} />
                                </CardContent>
                            </Card>
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader><CardTitle className="text-lg font-semibold">Contact Info</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormInputField form={form} name="contactNumber" label="Phone Number" />
                                    <FormInputField form={form} name="address" label="Residential Address" isTextarea />
                                </CardContent>
                            </Card>
                        </div>

                        {/* COLUMN 3: Compensation */}
                        <div className="space-y-6">
                            <Card className="bg-white shadow-sm border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">Benefits & Compensation</CardTitle>
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

            {/* --- MANAGE JOB ROLES DIALOG --- */}
            <Dialog open={isRoleDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Manage Job Roles</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 px-1 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
                        {/* CREATE ROLE */}
                        <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-dashed border-gray-300">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Plus className="h-4 w-4 text-blue-600" /> Create New Role
                            </h4>
                            <div className="space-y-2">
                                <Label>Role Name</Label>
                                <Input placeholder="Ex: Driver" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} className="bg-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Start</Label><Input type="time" value={roleForm.startTime} onChange={(e) => setRoleForm({ ...roleForm, startTime: e.target.value })} className="bg-white" /></div>
                                <div className="space-y-2"><Label>End</Label><Input type="time" value={roleForm.endTime} onChange={(e) => setRoleForm({ ...roleForm, endTime: e.target.value })} className="bg-white" /></div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3"><Checkbox id="allowOT" checked={roleForm.allowOvertime} onCheckedChange={(val) => setRoleForm({ ...roleForm, allowOvertime: val })} /><Label htmlFor="allowOT">Allow Normal OT</Label></div>
                                <div className="flex items-center gap-3"><Checkbox id="allowDOT" checked={roleForm.allowDoubleOT} onCheckedChange={(val) => setRoleForm({ ...roleForm, allowDoubleOT: val })} /><Label htmlFor="allowDOT" className="flex items-center gap-2">Allow Double OT <ShieldAlert className="h-3 w-3 text-orange-500" /></Label></div>
                            </div>
                            <Button onClick={handleCreateRole} size="sm" className="w-full">Save New Role</Button>
                        </div>

                        {/* EXISTING ROLES */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700">Existing Roles</h4>
                            <div className="border rounded-md divide-y overflow-hidden max-h-40 overflow-y-auto">
                                {roles.length === 0 ? <p className="p-4 text-center text-sm text-gray-400">No roles found.</p> : 
                                    roles.map(role => (
                                        <div key={role.value} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{role.label}</p>
                                                <p className="text-xs text-slate-500">{role.startTime} - {role.endTime} • {role.allowOvertime ? "OT: Yes" : "OT: No"}</p>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRole(role.value, role.label)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                }
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