import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useHolidays } from "@/src/hooks/workforce/useHoliday";

// Shadcn UI Imports
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";

const HolidayPage = () => {
    const { holidays, isLoading, addHoliday, removeHoliday } = useHolidays();
    
    // 1. STATE: Selected specific day (for adding holidays)
    const [date, setDate] = useState(new Date()); 
    
    // 2. STATE: Currently visible month (for the side list & calendar view)
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [newHolidayName, setNewHolidayName] = useState("");
    const [newHolidayType, setNewHolidayType] = useState("Mercantile");

    const isHoliday = (day) => {
        return holidays.some(h => new Date(h.date).toDateString() === day.toDateString());
    };

    // FIX: Filter based on 'currentMonth' (the view), NOT 'date' (the selection)
    const selectedMonthHolidays = holidays.filter(h => 
        new Date(h.date).getMonth() === currentMonth.getMonth() &&
        new Date(h.date).getFullYear() === currentMonth.getFullYear()
    );

    const handleAddHoliday = (e) => {
        e.preventDefault();
        addHoliday({
            date: date,
            name: newHolidayName,
            type: newHolidayType
        }, () => {
            setIsDialogOpen(false);
            setNewHolidayName("");
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Holiday Manager</h1>
                    <p className="text-sm text-muted-foreground mt-1">Configure Double OT days for the payroll system.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2 shadow-sm bg-[#0f172a] hover:bg-gray-700 text-white">
                            <Plus className="h-4 w-4" /> Add Holiday
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Holiday</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddHoliday} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Selected Date</Label>
                                <div className="flex items-center gap-2 border p-2 rounded-md bg-muted/30 text-sm font-medium">
                                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    {format(date, "PPPP")}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Holiday Name</Label>
                                <Input 
                                    placeholder="e.g. Vesak Poya Day" 
                                    value={newHolidayName}
                                    onChange={(e) => setNewHolidayName(e.target.value)}
                                    required
                                    className="h-9"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={newHolidayType} onValueChange={setNewHolidayType}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Mercantile">Mercantile (Standard)</SelectItem>
                                        <SelectItem value="Public">Public</SelectItem>
                                        <SelectItem value="Bank">Bank</SelectItem>
                                        <SelectItem value="Company">Company Specific</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" size="sm" className="bg-gray-600 hover:bg-gray-700">Save Holiday</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[500px]">
                
                {/* 1. BIG CALENDAR CARD */}
                <Card className="lg:col-span-8 h-full flex flex-col shadow-md border-t-4 border-t-gray-500 overflow-hidden">
                    <CardHeader className="border-b bg-gray-50/50 py-3 px-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 bg-white dark:bg-zinc-950 relative">
                        <Calendar
                            mode="single"
                            // Control BOTH selection and view
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                            month={currentMonth} 
                            onMonthChange={setCurrentMonth} // Syncs side panel immediately

                            className="p-2 w-full h-full flex flex-col"
                            classNames={{
                                months: "flex flex-col sm:flex-row w-full h-full",
                                month: "w-full h-full flex flex-col",
                                caption: "flex justify-center pt-2 relative items-center mb-2", 
                                caption_label: "text-lg font-bold text-gray-800",
                                
                                // FIX: ARROW POSITIONING & Z-INDEX
                                // Added z-20 to bring it to front, and adjusted spacing
                                nav: "space-x-2 flex items-center absolute right-4 top-3 z-20", 
                                nav_button: "h-8 w-8 bg-white shadow-sm border border-gray-200 p-0 hover:opacity-100 hover:bg-gray-100 transition rounded-md flex items-center justify-center",
                                nav_button_previous: "",
                                nav_button_next: "",

                                table: "w-full h-full border-collapse",
                                head_row: "flex w-full justify-between mb-1",
                                head_cell: "text-muted-foreground rounded-md w-full font-semibold text-xs uppercase tracking-wider text-center",
                                row: "flex w-full mt-1 justify-between flex-1",
                                cell: "h-full w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-16 w-full p-0 font-medium aria-selected:opacity-100 hover:bg-gray-50 hover:text-gray-600 rounded-md transition-all text-sm text-gray-600",
                                day_selected: "bg-gray-600 text-white hover:bg-gray-600 hover:text-white focus:bg-gray-600 focus:text-white shadow-md transform scale-105",
                                day_today: "bg-gray-100 text-gray-900 border border-gray-300",
                                day_outside: "text-gray-300 opacity-50",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_hidden: "invisible",
                            }}
                            modifiers={{
                                holiday: (date) => isHoliday(date)
                            }}
                            modifiersStyles={{
                                holiday: { 
                                    color: "#d75858ff", 
                                    fontWeight: "bold",
                                }
                            }}
                            components={{
                                DayContent: (props) => {
                                    const isHol = isHoliday(props.date);
                                    return (
                                        <div className="flex flex-col items-center justify-center h-full w-full relative">
                                            <span>{format(props.date, "d")}</span>
                                            {isHol && (
                                                <div className="absolute bottom-1.5 w-1 h-1 bg-red-500 rounded-full" />
                                            )}
                                        </div>
                                    )
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                {/* 2. SIDE LIST PANEL */}
                <Card className="lg:col-span-4 h-full flex flex-col shadow-md overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b py-3 px-4">
                        <CardTitle className="flex items-center gap-2 text-black-700 text-base">
                            {/* Uses currentMonth state to show the correct label */}
                            {format(currentMonth, "MMMM yyyy")}
                        </CardTitle>
                        <CardDescription className="text-gray-600/80 text-xs">Upcoming Poya & Holidays</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-3 space-y-2 bg-white scrollbar-thin scrollbar-thumb-gray-200">
                        {isLoading ? (
                            <p className="text-center text-xs text-muted-foreground mt-10">Syncing...</p>
                        ) : selectedMonthHolidays.length > 0 ? (
                            selectedMonthHolidays.map((holiday) => (
                                <div key={holiday._id} className="group flex items-center justify-between p-3 border rounded-lg bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-sm text-gray-800">{holiday.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                                                {format(new Date(holiday.date), "dd MMM")}
                                            </span>
                                            <Badge variant="outline" className={`text-[10px] h-5 px-1.5 border-0 ${
                                                holiday.type === 'Mercantile' ? 'bg-blue-50 text-blue-700' :
                                                holiday.type === 'Public' ? 'bg-green-50 text-green-700' :
                                                'bg-purple-50 text-purple-700'
                                            }`}>
                                                {holiday.type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                        onClick={() => removeHoliday(holiday._id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4 border-2 border-dashed rounded-lg border-gray-100 bg-gray-50/30">
                                <p className="text-gray-400 text-sm font-medium">No holidays</p>
                                {/* Fix: Button adds holiday for the currently selected date, not the random viewed month */}
                                <Button variant="link" size="sm" onClick={() => setIsDialogOpen(true)} className="text-gray-600 h-auto p-0 text-xs">
                                    Add for {format(date, "do")}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HolidayPage;