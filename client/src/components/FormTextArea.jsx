import PropTypes from "prop-types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/fomr";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";

const FormTextArea = ({
  form,
  name,
  label,
  placeholder,
  value,
  rows = 10,
  required = false,
  readOnly = false,
  isLoading = false,
}) => {
  return value ? (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className="w-full">
          <FormLabel className="text-gray-800 dark:text-gray-50">
            {label}{" "}
            {required && (
              <span className="text-red-600 dark:text-red-500">*</span>
            )}
          </FormLabel>
          <FormControl>
            {isLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : (
              <Textarea
                rows={rows}
                className="text-gray-950 dark:text-gray-50 dark:bg-[#0d0d18]"
                placeholder={placeholder}
                value={value}
                readOnly
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ) : (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-gray-800 dark:text-gray-50">
            {label}{" "}
            {required && (
              <span className="text-red-600 dark:text-red-500">*</span>
            )}
          </FormLabel>
          <FormControl>
            {isLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : (
              <Textarea
                rows={rows}
                className="text-gray-950 dark:text-gray-50 dark:bg-[#0d0d18]"
                placeholder={placeholder}
                readOnly={readOnly}
                {...field}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

FormTextArea.propTypes = {
  form: PropTypes.object,
  name: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  rows: PropTypes.number,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default FormTextArea;
