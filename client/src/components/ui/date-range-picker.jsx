import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

export function DateRangePicker({
  className,
  date,
  onDateChange,
}) {
  const [calendarMonth, setCalendarMonth] = React.useState(date?.from || new Date());

  const handlePrevMonth = () => {
    const prevMonth = new Date(calendarMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCalendarMonth(prevMonth);
    
    // Auto-select full previous month
    const monthFirstDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
    const monthLastDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
    onDateChange({ from: monthFirstDay, to: monthLastDay });
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(calendarMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCalendarMonth(nextMonth);
    
    // Auto-select full next month
    const monthFirstDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    const monthLastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
    onDateChange({ from: monthFirstDay, to: monthLastDay });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {/* Month Navigation - Now Sets Full Month Range */}
          <div className="flex items-center justify-between p-3 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0 hover:bg-accent"
              title="Previous month (full range)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(calendarMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0 hover:bg-accent"
              title="Next month (full range)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Calendar
            initialFocus
            mode="range"
            month={calendarMonth}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

