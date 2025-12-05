import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import PropTypes from "prop-types";
import { Skeleton } from "./ui/skeleton";

const FormDatePicker = ({
  form,
  name,
  label,
  required = false,
  isLoading = false,
  fromYear,
  toYear,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col w-full mt-2">
          <FormLabel className="text-gray-800 mb-0.5">
            {label}{" "}
            {required && (
              <span className="text-red-600">*</span>
            )}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <div>
                <FormControl>
                  {isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Button
                      type="button"
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal text-gray-500",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  )}
                </FormControl>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

FormDatePicker.propTypes = {
  form: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  isLoading: PropTypes.bool,
  fromYear: PropTypes.number,
  toYear: PropTypes.number,
};

export default FormDatePicker;
