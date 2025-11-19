import PropTypes from "prop-types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/fomr";
import { Skeleton } from "./ui/skeleton";
import { Checkbox } from "./ui/checkbox";

const FormCheckbox = ({
  form,
  name,
  label,
  required = false,
  isLoading = false,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="flex items-center space-x-3">
              {isLoading ? (
                <Skeleton className="h-5 w-5" />
              ) : (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
              <FormLabel className="text-gray-800 dark:text-gray-50 m-0">
                {label}
                {required && (
                  <span className="text-red-600 dark:text-red-500"> *</span>
                )}
              </FormLabel>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

FormCheckbox.propTypes = {
  form: PropTypes.object,
  name: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default FormCheckbox;
