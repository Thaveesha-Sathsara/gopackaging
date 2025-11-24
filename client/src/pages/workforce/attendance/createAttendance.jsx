import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/button";
import FormDatePicker from "@/src/components/FormDatePicker";
import DataTable from "@/src/components/DataTable";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Input } from "@/src/components/ui/input";
import { useEmployee } from "@/src/hooks/workforce/useEmployee";
import { useAttendance } from "@/src/hooks/workforce/useAttendance";
// import the columns from the file below
import { CreateAttendanceColumns } from "./createAttendanceCoulmns";

const CreateDailyAttendance = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    
    const { employees, isLoading: isLoadingEmployees } = useEmployee();

    const methods = useForm({
        defaultValues: {
            date: new Date(),
            records: []
        }
    });
    // WE NEED 'control' HERE FOR THE COLUMNS
    const { control, handleSubmit, setValue, watch } = methods;

    const selectedDate = watch("date");

    const { createDailyAttendance, isSaving, dailyRecords, isLoadingDaily } = useAttendance(
        null,
        null,
        selectedDate
    );

    const { fields, replace } = useFieldArray({
        control,
        name: "records"
    });

    // --- FIX 1: Ensure Status is Initialized ---
    useEffect(() => {
        if (employees && dailyRecords && !isLoadingDaily) {
            
            const recordsMap = new Map();
            dailyRecords.forEach(record => {
                const empId = record.employee?._id || record.employee;
                if (empId) {
                    recordsMap.set(empId.toString(), record);
                }
            });

            const mergedRecords = employees.map(emp => {
                const existingRecord = recordsMap.get(emp._id.toString());

                return {
                    employeeId: emp._id, // Critical for Saving
                    employeeID: emp.employeeID,
                    employeeName: emp.employeeName,
                    position: emp.position,
                    // ✅ CRITICAL: Default to "Present" if no record exists
                    status: existingRecord ? existingRecord.status : "Present",
                    startTime: existingRecord ? existingRecord.startTime : "",
                    endTime: existingRecord ? existingRecord.endTime : "",
                    totalHours: existingRecord ? existingRecord.totalHours : 0,
                };
            });
            
            replace(mergedRecords);
        }
    }, [employees, dailyRecords, isLoadingDaily, replace]);

    const filteredFields = fields.filter(field =>
        field.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

        const onSubmit = (data) => {
            const validRecords = data.records.filter(record => {
                if (record.status === "Leave") {
                    return true;
                }

                if (record.status === "Present") {
                    if (record.totalHours && parseFloat(record.totalHours) > 0) {
                        return true;
                    }
                    if (record.startTime && record.endTime) {
                        return true;
                    }
                }
                return false;
            });

            if (validRecords.length === 0) {
                console.warn("No valid records to save.");
                return;
            }

            createDailyAttendance({
                date: data.date,
                records: validRecords
            }, {
                onSuccess: () => {
                    navigate("/workforce/attendance");
                }
            });
        };
    
        const isLoading = isLoadingEmployees || isLoadingDaily;

        return (
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="py-6 h-full flex flex-col gap-4">
                    <div className="px-6 flex flex-col md:flex-row gap-4 items-center">
                        <h1 className="text-2xl font-semibold">Mark Daily Attendance</h1>
                        <div className="flex gap-4 md:ml-auto">
                            <FormDatePicker
                                form={methods}
                                name="date"
                                label="Attendance Date"
                            />
                            <Input
                                placeholder="Search Employee..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64"
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="px-6 mt-3 max-w-screen-lg min-w-full">
                            <DataTable
                                // ✅ PASS 'control' SO CELLS CAN WATCH FOR CHANGES
                                columns={CreateAttendanceColumns(control, setValue)}
                                data={filteredFields}
                                title="Employees"
                                emptyMessage="No employees found."
                                isLoading={isLoading}
                            />
                        </div>
                    </ScrollArea>

                    <div className="px-6 py-4 border-t bg-background sticky bottom-0">
                        <div className="flex justify-end gap-4">
                            <Link to="/workforce/attendance">
                                <Button variant="destructive" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={isSaving || isLoading}>
                                {isSaving ? "Saving..." : "Save Attendance"}
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        );
};

export default CreateDailyAttendance;