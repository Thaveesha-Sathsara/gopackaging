import React, { useRef } from 'react';
import PropTypes from "prop-types";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// --- UI Components (Simplified for this file) ---
const cn = (...classes) => classes.filter(Boolean).join(' ');

const Button = ({ children, className, ...props }) => (
    <button 
        type="button" 
        className={cn(
            "flex items-center w-full px-3 py-2 text-sm border rounded-md shadow-sm transition-colors",
            "bg-white border-gray-300",
            "hover:bg-gray-50 focus:ring-2 focus:ring-blue-500",
            className
        )} 
        {...props}
    >
        {children}
    </button>
);

// We assume these are imported from your UI library in the real app, 
// but for this file to work standalone as requested:
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Skeleton } from "@/src/components/ui/skeleton";


const FormDatePickerYearFirst = ({
    form,
    name,
    label,
    required = false,
    isLoading = false,
    fromYear,
    toYear,
}) => {
    const dateInputRef = useRef(null);

    // ✅ FIX 1: Convert Date Object -> YYYY-MM-DD String (Local Time)
    // This ensures that Nov 27th stays Nov 27th, regardless of timezone.
    const getInputValue = (date) => {
        if (!date) return "";
        const d = new Date(date);
        // Manual formatting prevents UTC shift
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper for Display Text (e.g., "Nov 27, 2025")
    const getDisplayString = (date) => {
        if (!date) return "Pick a date";
        // Check if valid
        const d = new Date(date);
        return isNaN(d.getTime()) ? "Pick a date" : format(d, "PPP");
    };

    // ✅ FIX 2: Handle Date Selection (String -> Date Object)
    // We set the time to NOON (12:00) to safely avoid timezone shifts when saving.
    const handleDateChange = (e, onChange) => {
        const value = e.target.value; // "2025-11-27"
        if (!value) {
            onChange(null);
            return;
        }
        const [y, m, d] = value.split('-').map(Number);
        // Create date at 12:00 PM Local Time
        const safeDate = new Date(y, m - 1, d, 12, 0, 0);
        onChange(safeDate);
    };

    // Calculate Min/Max for the HTML Input
    const currentYear = new Date().getFullYear();
    const minDate = fromYear ? `${fromYear}-01-01` : undefined;
    const maxDate = toYear ? `${toYear}-12-31` : `${currentYear + 50}-12-31`;

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col w-full mt-2">
                    <FormLabel className="text-gray-800 mb-1 font-medium">
                        {label} {required && <span className="text-red-600">*</span>}
                    </FormLabel>
                    
                    <FormControl>
                        {isLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <div className="relative">
                                {/* 1. Visible Button Trigger */}
                                <Button
                                    onClick={() => {
                                        // Try showPicker() (Modern), fallback to focus()
                                        try {
                                            dateInputRef.current?.showPicker();
                                        } catch (err) {
                                            dateInputRef.current?.focus(); 
                                        }
                                    }}
                                    className={!field.value ? "text-muted-foreground" : ""}
                                >
                                    {getDisplayString(field.value)}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>

                                {/* 2. Hidden Native Input (The Real Logic) */}
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-none"
                                    // Positioning it absolutely over the button but invisible
                                    // allows 'showPicker' to position the calendar correctly relative to it.
                                    style={{ visibility: 'hidden', position: 'absolute' }} 
                                    
                                    value={getInputValue(field.value)}
                                    onChange={(e) => handleDateChange(e, field.onChange)}
                                    min={minDate}
                                    max={maxDate}
                                    tabIndex={-1}
                                />
                            </div>
                        )}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

FormDatePickerYearFirst.propTypes = {
    form: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    isLoading: PropTypes.bool,
    fromYear: PropTypes.number,
    toYear: PropTypes.number,
};

export default FormDatePickerYearFirst;