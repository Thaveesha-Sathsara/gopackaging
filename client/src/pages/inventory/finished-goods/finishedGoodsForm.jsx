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
    name: z.string().min(1, "Product Name is required"),
    unit: z.string().min(1, "Unit is required"),
    description: z.string().optional(),
});

const FinishedGoodForm = ({ open, onOpenChange, itemToEdit }) => {
    const { createItem, updateItem } = useInventory("finished-goods");
        const [isProcessing, setIsProcessing] = React.useState(false);
    const isEditMode = !!itemToEdit;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            unit: "",
            description: "",
        }
    });

    useEffect(() => {
        if (itemToEdit) {
            form.reset({
                name: itemToEdit.name,
                unit: itemToEdit.unit,
                description: itemToEdit.description || "",
            });
        } else {
            form.reset({
                name: "",
                unit: "",
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

    const unitOptions = [
        { label: "Units/Pieces", value: "units" },
        { label: "Bundles", value: "bundles" },
        { label: "Boxes", value: "boxes" },
        { label: "Kilograms (kg)", value: "kg" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Define New Product</DialogTitle>
                    <DialogDescription>
                        Add a finished good that you manufacture.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormInputField 
                            form={form} name="name" label="Product Name" 
                            placeholder="e.g., Garbage Bag (Large)" 
                        />
                        
                        <FormSelector 
                            form={form} name="unit" label="Stock Unit" 
                            options={unitOptions} placeholder="Select..." 
                        />

                        <FormInputField 
                            form={form} name="description" label="Description / Notes" 
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
                            isEditMode ? "Save Changes" : "Create Product"
                        )   }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default FinishedGoodForm;