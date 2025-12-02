import React, { useRef } from 'react'; // <-- Added useRef
import PropTypes from "prop-types";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// --- START: Self-Contained UI Component Definitions (to fix imports) ---

// Simplified cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Dummy Popover/Trigger/Content (No longer strictly needed but kept for style consistency)
const Popover = ({ children }) => <div className="relative">{children}</div>;
const PopoverTrigger = ({ children, asChild }) => asChild ? children : <div>{children}</div>;
const PopoverContent = ({ children, className }) => (
    <div className={cn("absolute z-50 bg-white border rounded-lg shadow-lg p-2", className)}>{children}</div>
);

// Simplified shadcn/ui components (FormItem, FormLabel, FormControl, FormMessage)
// FIX: Corrected FormItem definition to remove duplicate 'className' attribute
const FormItem = ({ children, className }) => <div className={cn("space-y-1", className)}>{children}</div>; 
const FormLabel = ({ children, className }) => <label className={cn("block text-sm font-medium", className)}>{children}</label>;
const FormControl = ({ children }) => <div>{children}</div>;
const FormMessage = () => <p className="text-sm text-red-500 mt-1"></p>;
const FormField = ({ render }) => render({}); // Dummy for useForm/Controller structure

// Button component placeholder (Modified to reflect a standard UI button)
const Button = ({ children, className, variant, ...props }) => (
    <button className={cn("flex items-center justify-center h-10 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition", className)} {...props}>
        {children}
    </button>
);

// Skeleton component placeholder
const Skeleton = ({ className }) => <div className={cn("animate-pulse bg-gray-200 rounded-md", className)} />;

// --- END: Self-Contained UI Component Definitions ---

// 💡 NEW COMPONENT NAME: FormDatePickerYearFirst
const FormDatePickerYearFirst = ({
    form,
    name,
    label,
    required = false,
    isLoading = false,
    fromYear,
    toYear,
}) => {
    // Ref for the hidden native date input element
    const dateInputRef = useRef(null);

    // Helper to format Date object into YYYY-MM-DD string for native input
    const getFormattedDate = (value) => {
        if (!value) return "";
        try {
            // Ensure we use a UTC date representation for reliable input value binding
            const date = new Date(value);
            return date.toISOString().split('T')[0];
        } catch {
            return "";
        }
    };
    
    // Helper to get the display string (e.g., "Oct 12, 1985")
    const getDisplayString = (value) => {
        if (!value) return "Pick a date";
        try {
            // Ensure the value is a valid Date object before formatting
            const date = new Date(value);
            if (isNaN(date)) return "Invalid Date";
            return format(date, "PPP");
        } catch {
            return "Invalid Date";
        }
    };
    
    // Determine the max selectable year (defaults to current year)
    const currentYear = new Date().getFullYear();
    const finalToYear = toYear || currentYear;


    return (
        <FormField // Dummy FormField wrapper
            render={({ field = { value: null, onChange: () => {} } }) => ( // Mock field object
                <FormItem className="flex flex-col w-full mt-2">
                    <FormLabel className="text-gray-800 dark:text-gray-50 mb-0.5">
                        {label}{" "}
                        {required && (
                            <span className="text-red-600 dark:text-red-500">*</span>
                        )}
                    </FormLabel>
                    <FormControl>
                        {isLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <div className="relative">
                                {/* 1. VISIBLE BUTTON: Displays the formatted date and acts as the click target */}
                                <Button
                                    type="button"
                                    // Use showPicker() to open the native calendar dialog on click
                                    onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
                                    className={cn(
                                        // Use full button width/height but adjust padding and text alignment
                                        "w-full px-3 h-10 justify-start", 
                                        "text-sm",
                                        !field.value ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100",
                                        "border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200",
                                        "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                                    )}
                                >
                                    <span>{getDisplayString(field.value)}</span>
                                    <CalendarIcon className="h-4 w-4 opacity-50 ml-auto" />
                                </Button>
                                
                                {/* 2. HIDDEN NATIVE INPUT: The functional element for picking the date */}
                                <input
                                    type="date"
                                    ref={dateInputRef} // Attach ref to trigger the picker
                                    // Completely hide the input element off-screen but keep it functional
                                    className="absolute left-0 top-0 w-0 h-0 p-0 m-0 border-0 overflow-hidden" 
                                    tabIndex={-1} // Prevent keyboard focus

                                    min={fromYear ? `${fromYear}-01-01` : undefined}
                                    max={toYear ? `${toYear}-12-31` : `${finalToYear}-12-31`}
                                    value={getFormattedDate(field.value)}
                                    onChange={(e) => {
                                        // When the native input changes, convert the YYYY-MM-DD string back to a Date object 
                                        // before passing it to React Hook Form's field.onChange.
                                        const dateValue = e.target.value ? new Date(e.target.value) : null;
                                        field.onChange(dateValue);
                                    }}
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