import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, FormProvider, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/src/services/axiosInstance";
import { createAlert, errorAlert } from "@/src/lib/alert";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import DataTable from "@/src/components/DataTable";
import { Loader2, Pencil, Save, X } from "lucide-react";
import DataTableColumnHeader from "@/src/components/DataTableCoulmnHeader";

const MonthlyAdjustments = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    
    // ✅ 1. New State for Edit Mode
    const [isEditing, setIsEditing] = useState(false);

    // --- HOOKS ---
    const fetchAdjustments = async (month) => {
        const res = await axiosInstance.get(`/api/workforce/payroll/adjustments`, { params: { date: month + "-01" } });
        return res.data;
    };

    const { data: adjustments, isLoading, refetch } = useQuery({
        queryKey: ["payrollAdjustments", selectedMonth],
        queryFn: () => fetchAdjustments(selectedMonth)
    });

    const { mutate: saveAdjustments, isPending: isSaving } = useMutation({
        mutationFn: async (data) => {
            await axiosInstance.post(`/api/workforce/payroll/adjustments`, { date: selectedMonth + "-01", records: data });
        },
        onSuccess: () => {
            createAlert("Adjustments Saved!");
            setIsEditing(false); // ✅ Exit edit mode on success
            refetch();
        },
        onError: (err) => errorAlert("Error saving", err)
    });

    // --- FORM ---
    const methods = useForm({ defaultValues: { records: [] } });
    const { control, handleSubmit, reset } = methods;
    const { fields } = useFieldArray({ control, name: "records" });

    const resetMonth = async () => {
    if(!window.confirm("Are you sure? This will DELETE all adjustments for the selected month to test the ETF carry-over.")) return;
    
    // We cheat and send empty records to overwrite, or better, we can't easily delete via bulkWrite without a new API.
    // Instead, let's just use the editing mode to set everything to TRUE manually once, save it, and then see if it sticks for Next Month.
    alert("Please use your Database (Compass) to delete the 'payrolladjustments' for this specific month. The code logic cannot overwrite an existing 'False' value because it thinks you deliberately turned it off.");
}

    useEffect(() => {
        if (adjustments) reset({ records: adjustments });
    }, [adjustments, reset]);

    // --- COLUMNS ---
    const columns = [
        { 
            accessorKey: "employeeID", 
            header: ({ column }) => <DataTableColumnHeader column={column} title="Emp ID" />
        },
        { 
            accessorKey: "employeeName", 
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        },
        {
            id: "meal",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Meal Allowance" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Controller control={control} name={`records.${row.index}.isMealClaimed`}
                        render={({ field }) => (
                            <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                                disabled={!isEditing}
                            />
                        )}
                    />
                    <span className="text-xs text-gray-500 font-mono">
                        ({row.original.allowanceMeal?.toLocaleString()})
                    </span>
                </div>
            )
        },
        {
            id: "medical",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Medical Allowance" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Controller control={control} name={`records.${row.index}.isMedicalClaimed`}
                        render={({ field }) => (
                            <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                                disabled={!isEditing}
                            />
                        )}
                    />
                    <span className="text-xs text-gray-500 font-mono">
                        ({row.original.allowanceMedical?.toLocaleString()})
                    </span>
                </div>
            )
        },
        {
            id: "advance",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Advance Payment" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Controller control={control} name={`records.${row.index}.isAdvanceTaken`}
                        render={({ field }) => (
                            <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                                disabled={!isEditing} // ✅ Disabled
                            />
                        )}
                    />
                    <span className="text-xs text-gray-500 font-mono">
                        ({row.original.fixedAdvanceAmount?.toLocaleString()})
                    </span>
                </div>
            )
        },
        {
            id: "etfRate",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ETF" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Controller control={control} name={`records.${row.index}.isEtfApplied`}
                        render={({ field }) => (
                            <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                                disabled={!isEditing}
                            />
                        )}
                    />
                    <span className="text-xs text-gray-500 font-mono">
                        ({row.original.etfRate?.toLocaleString()} %)
                    </span>
                </div>
            )
        },
        {
            id: "bonus",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Bonus" />,
            cell: ({ row }) => (
                <div className="flex gap-2 items-center">
                    <Controller control={control} name={`records.${row.index}.bonusAmount`}
                        render={({ field }) => (
                            <Input 
                                {...field} 
                                type="number" 
                                placeholder="0" 
                                className="w-24 h-8 text-right" 
                                disabled={!isEditing} // ✅ Disabled
                            />
                        )}
                    />
                    <Controller control={control} name={`records.${row.index}.bonusRemark`}
                        render={({ field }) => (
                            <Input 
                                {...field} 
                                placeholder={isEditing ? "Reason..." : "-"} 
                                className="w-32 h-8" 
                                disabled={!isEditing} // ✅ Disabled
                            />
                        )}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="p-6 flex flex-col h-full gap-6 bg-gray-50/50">
            {/* Header Section */}
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payroll Adjustments</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage monthly variable allowances and deductions.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Month Picker */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Select Month</span>
                        <Input 
                            type="month" 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)} 
                            className="w-40 bg-white"
                            disabled={isEditing}
                        />
                    </div>

                    <Button variant="outline" onClick={resetMonth} className="gap-2">
                        Reset Month Data
                    </Button>

                    <div className="h-8 w-px bg-gray-300 mx-2"></div>

                    {/* ✅ Action Buttons Logic */}
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="gap-2">
                            <Pencil className="h-4 w-4" /> Edit Adjustments
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => { setIsEditing(false); refetch(); }} className="gap-2">
                                <X className="h-4 w-4" /> Cancel
                            </Button>
                            <Button onClick={handleSubmit((data) => saveAdjustments(data.records))} disabled={isSaving} className="gap-2 min-w-[140px]">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <ScrollArea>
                <DataTable 
                    columns={columns} 
                    data={fields} 
                    isLoading={isLoading}
                    emptyMessage="No employees found for adjustment."
                />
            </ScrollArea>
        </div>
    );
};

export default MonthlyAdjustments;