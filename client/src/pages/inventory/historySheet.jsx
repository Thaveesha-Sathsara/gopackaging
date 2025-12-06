import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/src/components/ui/sheet";
import { useInventory } from '@/src/hooks/inventory/useInventory';
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

const HistorySheet = ({ item, open, onOpenChange }) => {
    // This hook needs to be exposed from useInventory as shown in step 4
    const { useItemHistory } = useInventory(); 
    const { data: history, isLoading } = useItemHistory(item?._id);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Transaction History</SheetTitle>
                    <SheetDescription>
                        {item?.name} ({item?.materialID || item?.productID})
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : history?.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10">No transactions recorded yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {history?.map((record) => (
                                <div key={record._id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${record.type === 'in' ? 'bg-green-100' : 'bg-orange-100'}`}>
                                            {record.type === 'in' 
                                                ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> 
                                                : <ArrowUpRight className="h-4 w-4 text-orange-600" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{record.reason}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(record.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${record.type === 'in' ? 'text-green-600' : 'text-orange-600'}`}>
                                        {record.type === 'in' ? '+' : '-'}{record.quantity} <span className="text-xs text-gray-500 font-normal">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default HistorySheet;