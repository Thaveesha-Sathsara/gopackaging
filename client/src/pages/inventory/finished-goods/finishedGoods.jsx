import React, { useState } from 'react';
import DataTable from "@/src/components/DataTable";
import DataTableColumnHeader from "@/src/components/DataTableCoulmnHeader";
import { Button } from "@/src/components/ui/button";
import { Factory, Truck, PackagePlus, Pencil, History, Calendar as CalendarIcon, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
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
import DeleteConfirmationDialog from '@/src/components/DeleteConfirmationDialog';
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import FinishedGoodForm from './finishedGoodsForm';
import HistorySheet from '../historySheet';
import { ScrollArea } from '@radix-ui/react-scroll-area';

const FinishedGoods = () => {
    const { items, isLoading, adjustStock, deleteItem, isDeleting } = useInventory("finished-goods");
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [adjustType, setAdjustType] = useState(null);
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
            accessorKey: "productID",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Product ID" />,
            cell: ({ row }) => <span className="font-mono text-xs font-bold text-gray-600">{row.getValue("productID")}</span>
        },
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Product Name" />,
            cell: ({ row }) => <span className="font-semibold">{row.getValue("name")}</span>
        },
        {
            accessorKey: "currentStock",
            header: ({ column }) => <DataTableColumnHeader column={column} title="In Stock" />,
            cell: ({ row }) => {
                const stock = row.getValue("currentStock");
                const unit = row.original.unit;
                
                return (
                    <div className="flex items-center gap-2 text-blue-700 font-bold">
                        {stock} <span className="text-xs text-gray-500 font-normal">{unit}</span>
                    </div>
                );
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {/* Production Button */}
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-2 border-blue-500 text-blue-600 hover:bg-blue-50 gap-2"
                        onClick={() => { setSelectedItem(row.original); setAdjustType("produce"); }}
                    >
                        <Factory className="h-3.5 w-3.5" /> Produce
                    </Button>
                    
                    {/* Shipment Button */}
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-2 border-orange-500 text-orange-600 hover:bg-orange-50 gap-2"
                        onClick={() => { setSelectedItem(row.original); setAdjustType("ship"); }}
                    >
                        <Truck className="h-3.5 w-3.5" /> Ship
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
        <div className="p-6 h-full flex flex-col gap-6 bg-gray-50/50">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-2x2 font-bold">Finished Goods</h1>
                    <p className="text-gray-500">Track production and shipments</p>
                </div>
                <Button onClick={handleCreate}>
                    <PackagePlus className="mr-2 h-4 w-4" /> Define New Product
                </Button>
            </div>

            <ScrollArea>
            <DataTable 
                columns={columns} 
                data={items || []} 
                isLoading={isLoading}
                emptyMessage="No finished goods defined yet."
                />
            </ScrollArea>

            {/* Adjust Stock Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {adjustType === "produce" ? "Add Stock" : "Record Usage"} - {selectedItem?.name}
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
                            adjustType === "produce" ? "Add to Stock" : "Deduct from Stock"
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

            {/* Create Form */}
            <FinishedGoodForm
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

export default FinishedGoods;