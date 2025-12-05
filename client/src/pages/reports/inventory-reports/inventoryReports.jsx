import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    ComposedChart, Line, ReferenceLine 
} from 'recharts';
import { Package, AlertTriangle, ArrowRightLeft, Layers } from "lucide-react";

const InventoryReports = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api/reports/inventory') 
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    if (!data) return <div className="p-6">Loading Inventory Analytics...</div>;

    const { rawMaterialStats, movement } = data;

    // Filter Top 10 Raw Materials for Charting to avoid overcrowding
    const chartData = rawMaterialStats.details.slice(0, 10);

    return (
        <div className="p-6 min-h-screen bg-gray-50/50 text-gray-900 flex flex-col gap-6">
            
            <div className="mb-2">
                <h1 className="text-3xl font-bold">Inventory Intelligence</h1>
                <p className="text-muted-foreground text-sm">Stock levels, movement analysis, and critical alerts.</p>
            </div>

            {/* 1. KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Total Materials" value={rawMaterialStats.total} icon={Layers} color="text-blue-500" bg="bg-blue-50" />
                <KpiCard title="Healthy Stock" value={rawMaterialStats.healthyStock} icon={Package} color="text-green-500" bg="bg-green-50" />
                <KpiCard title="Low Stock" value={rawMaterialStats.lowStock} icon={AlertTriangle} color="text-orange-500" bg="bg-orange-50" />
                <KpiCard title="Out of Stock" value={rawMaterialStats.outOfStock} icon={AlertTriangle} color="text-red-500" bg="bg-red-50" />
            </div>

            {/* 2. CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* STOCK VS REORDER LEVEL */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Stock Level vs Minimum</CardTitle>
                        <CardDescription>Top 10 Items. Red Line = Reorder Point.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid stroke="#374151" opacity={0.1} horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#6b7280'}} />
                                <Tooltip contentStyle={{backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none'}} />
                                <Bar dataKey="stock" barSize={15} fill="#3b82f6" radius={[0, 4, 4, 0]} name="Current Stock">
                                </Bar>
                                <Line dataKey="min" stroke="#ef4444" strokeWidth={2} dot={false} name="Min Level" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* IN/OUT MOVEMENT */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Stock Movement (30 Days)</CardTitle>
                        <CardDescription>Inward (Purchase/Production) vs Outward (Usage/Sales)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={movement}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="_id" tick={{fontSize: 10}} tickFormatter={(val) => val.slice(5)} />
                                <YAxis />
                                <Tooltip contentStyle={{backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none'}} />
                                <Bar dataKey="inward" fill="#10b981" name="In" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="outward" fill="#f43f5e" name="Out" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* 3. DETAILED TABLE (Low Stock Focus) */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Detailed Inventory Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Item Name</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Current Stock</th>
                                    <th className="px-6 py-3 text-right">Min Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rawMaterialStats.details.map((item, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{item.name}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={item.status === "Critical" ? "destructive" : "default"} className={item.status === "Good" ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold">{item.stock}</td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">{item.min}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const KpiCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className={`p-3 rounded-full ${bg} mr-4`}>
            <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
        </div>
    </div>
);

export default InventoryReports;