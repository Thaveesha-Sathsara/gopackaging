import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { AlertTriangle } from "lucide-react";

const DeleteConfirmationDialog = ({ open, onOpenChange, item, onDelete, isDeleting }) => {
    const [confirmText, setConfirmText] = useState("");
    
    // Reset text when dialog opens/closes
    useEffect(() => {
        if (open) setConfirmText("");
    }, [open]);

    // The user must type this EXACT name
    const targetName = item?.name || "";
    const isMatch = confirmText === targetName;

    const handleDelete = () => {
        if (isMatch) {
            onDelete(item._id);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Delete Item
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete 
                        <span className="font-bold text-black mx-1">
                            {targetName}
                        </span> 
                        and all its history.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="flex flex-col gap-2">
                        <Label>
                            Please type <span className="font-mono font-bold text-red-600 select-all">{targetName}</span> to confirm.
                        </Label>
                        <Input 
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type item name here"
                            className="border-red-200 focus-visible:ring-red-500"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleDelete} 
                        disabled={!isMatch || isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete Permanently"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteConfirmationDialog;