import React, { useState } from 'react';
import DataTable from "@/src/components/DataTable"; // Reusing your table!
import DataTableColumnHeader from "@/src/components/DataTableCoulmnHeader";
import { Button } from "@/src/components/ui/button";
import { Plus, Minus, PackagePlus, Pencil, History, Calendar as CalendarIcon, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useInventory } from '@/src/hooks/inventory/useInventory';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/src/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/src/components/ui/sheet";
import FormDatePicker from '@/src/components/FormDatePicker';
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import RawMaterialForm from './rawMaterialsForm';
import HistorySheet from '../historySheet';
import DeleteConfirmationDialog from '@/src/components/DeleteConfirmationDialog';

const RawMaterials = () => {
    const { items, isLoading, adjustStock, deleteItem, isDeleting } = useInventory("raw-materials");
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [adjustType, setAdjustType] = useState(null); // "add" or "use"
    const [qty, setQty] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [adjustDate, setAdjustDate] = useState(new Date());
    const [historyItem, setHistoryItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleCreate = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    }

    const handleDelete = (id) => {
        deleteItem(id, {
            onSuccess: () => setItemToDelete(null)
        });
    };

    const handleAdjust = () => {
        if (!selectedItem || !qty) return;
        
        setIsProcessing(true);

        adjustStock({ 
            id: selectedItem._id, 
            adjustment: qty, 
            operationType: adjustType,
            date: adjustDate 
        }, {
            onSuccess: () => {
                setSelectedItem(null);
                setTimeout(() => {
                    setQty("");
                    setAdjustDate(new Date());
                    setIsProcessing(false);
                }, 500); 
            },
            onError: () => {
                setIsProcessing(false);
            }
        });
    };

    const columns = [
        {
            accessorKey: "materialID",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("materialID")}</span>
        },
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Material Name" />,
            cell: ({ row }) => <span className="font-semibold">{row.getValue("name")}</span>
        },
        {
            accessorKey: "category",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        },
        {
            accessorKey: "currentStock",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Stock Level" />,
            cell: ({ row }) => {
                const stock = row.getValue("currentStock");
                const unit = row.original.unit;
                const min = row.original.minimumLevel;
                const isLow = stock < min;
                
                return (
                    <div className={`flex items-center gap-2 ${isLow ? "text-red-600 font-bold" : "text-green-700"}`}>
                        {stock} <span className="text-xs text-gray-500">{unit}</span>
                        {isLow && <span className="text-xs bg-red-100 text-red-600 px-1 rounded">LOW</span>}
                    </div>
                );
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex gap-2">


                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 border-green-500 hover:bg-green-50"
                        onClick={() => { setSelectedItem(row.original); setAdjustType("add"); }}
                    >
                        <Plus className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 border-orange-500 hover:bg-orange-50"
                        onClick={() => { setSelectedItem(row.original); setAdjustType("use"); }}
                    >
                        <Minus className="h-4 w-4 text-orange-600" />
                    </Button>

                    <div className="w-px h-4 bg-gray-300 mx-1"></div>

                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                        onClick={() => setHistoryItem(row.original)}
                        title="View History"
                    >
                        <History className="h-4 w-4 text-blue-600" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={() => setItemToDelete(row.original)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 h-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Raw Materials</h1>
                    <p className="text-gray-500">Manage your inventory inputs</p>
                </div>
                <Button onClick={handleCreate}>
                    <PackagePlus className="mr-2 h-4 w-4" /> Add New Material Type
                </Button>
            </div>

            <DataTable 
                columns={columns} 
                data={items || []} 
                isLoading={isLoading}
                title="Inventory List"
            />

            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {adjustType === "add" ? "Add Stock" : "Record Usage"} - {selectedItem?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Current Stock: {selectedItem?.currentStock} {selectedItem?.unit}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Date</Label>
                            <div className="col-span-3">
                                <input
                                    type="date"
                                    value={adjustDate.toISOString().split('T')[0]}
                                    onChange={(e) => setAdjustDate(new Date(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Quantity</Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Input 
                                    type="number" 
                                    value={qty} 
                                    onChange={(e) => setQty(e.target.value)} 
                                    autoFocus
                                />
                                <span className="text-sm font-bold">{selectedItem?.unit}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAdjust} disabled={isProcessing}>
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                            adjustType === "add" ? "Add to Inventory" : "Remove from Inventory"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <HistorySheet
                item={historyItem}
                open={!!historyItem}
                onOpenChange={(open) => !open && setHistoryItem(null)}
            />

            {/* Create New Item Dialog */}
            <RawMaterialForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                itemToEdit={editingItem}
            />

            <DeleteConfirmationDialog 
                open={!!itemToDelete} 
                onOpenChange={(open) => !open && setItemToDelete(null)}
                item={itemToDelete}
                onDelete={handleDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default RawMaterials;