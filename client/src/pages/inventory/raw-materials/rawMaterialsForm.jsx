import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { useInventory } from '@/src/hooks/inventory/useInventory';
import FormInputField from "@/src/components/FormInputField";
import FormSelector from "@/src/components/FormSelector";
import { Form } from "@/src/components/ui/form";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    unit: z.string().min(1, "Unit is required"),
    minimumLevel: z.coerce.number().min(0, "Must be a positive number"),
    description: z.string().optional(),
});

const RawMaterialForm = ({ open, onOpenChange, itemToEdit }) => {
    const { createItem, updateItem } = useInventory("raw-materials");
    const [isProcessing, setIsProcessing] = React.useState(false);
    const isEditMode = !!itemToEdit; 

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "",
            unit: "",
            minimumLevel: 10,
            description: "",
        }
    });

    useEffect(() => {
        if (itemToEdit) {
            form.reset({
                name: itemToEdit.name,
                category: itemToEdit.category,
                unit: itemToEdit.unit,
                minimumLevel: itemToEdit.minimumLevel,
                description: itemToEdit.description || "",
            });
        } else {
            form.reset({
                name: "",
                category: "",
                unit: "",
                minimumLevel: 10,
                description: "",
            });
        }
    }, [itemToEdit, form]);

    const onSubmit = (data) => {
        setIsProcessing(true);
        
        const payload = isEditMode ? { id: itemToEdit._id, data } : data;
        const action = isEditMode ? updateItem : createItem;

        action(payload, {
            onSuccess: () => {
                onOpenChange(false);
                setTimeout(() => {
                    form.reset();
                    setIsProcessing(false);
                }, 500);
            },
            onError: () => {
                setIsProcessing(false);
            }
        });
    };

    const categoryOptions = [
        { label: "Raw Polymer", value: "Raw Polymer" },
        { label: "Ink & Pigment", value: "Ink & Pigment" },
        { label: "Additives", value: "Additives" },
        { label: "Packaging Material", value: "Packaging Material" },
        { label: "General", value: "General" },
    ];

    const unitOptions = [
        { label: "Kilograms (kg)", value: "kg" },
        { label: "Liters (L)", value: "L" },
        { label: "Meters (m)", value: "m" },
        { label: "Units/Pieces", value: "units" },
        { label: "Rolls", value: "rolls" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Material" : "Define New Raw Material"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? `Update details for ${itemToEdit.materialID}` : "Add a new material to your inventory catalog."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormInputField 
                            form={form} name="name" label="Material Name" 
                            placeholder="e.g., HDPE Granules" 
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormSelector 
                                form={form} name="category" label="Category" 
                                options={categoryOptions} placeholder="Select..." 
                            />
                            <FormSelector 
                                form={form} name="unit" label="Measurement Unit" 
                                options={unitOptions} placeholder="Select..." 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormInputField 
                                form={form} name="minimumLevel" label="Minimum Stock Alert" 
                                type="number"
                            />
                        </div>

                        <FormInputField 
                            form={form} name="description" label="Description (Optional)" 
                            isTextarea 
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isProcessing}>
                                {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            isEditMode ? "Save Changes" : "Create Material"
                        )   }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default RawMaterialForm;