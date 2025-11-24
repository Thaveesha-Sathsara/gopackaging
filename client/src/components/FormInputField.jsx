import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import PropTypes from "prop-types";
import { Skeleton } from "@/src/components/ui/skeleton"; // Corrected the import path
import { useFormContext } from "react-hook-form";

const FormInputField = ({
  form: formProp,
  type = "text",
  name,
  label,
  placeholder,
  value,
  required = false,
  readOnly = false,
  isLoading = false,
}) => {
  const contextForm = useFormContext();
  const form = formProp || contextForm;

  if (!form) {
    console.error(
      "FormInputField must be used within a <Form> provider or be passed a 'form' prop."
    );
    return null;
  }

  const { control } = form;

  return value ? (
    <FormField
      control={control}
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
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                type={type}
                className="text-gray-950 dark:text-gray-50 dark:placeholder:text-[#0d0d18] dark:bg-[#0d0d18] dark:border-[#33343f] dark:read-only:bg-[#1a1b26]"
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
      control={control}
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
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                type={type}
                className="text-gray-950 dark:text-[#ffffff] dark:placeholder:text-[#8f8fa3] dark:bg-[#0d0d18] dark:border-[#33343f] dark:read-only:bg-[#1a1b26]"
                placeholder={placeholder}
                {...field}
                readOnly={readOnly}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

FormInputField.propTypes = {
  form: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default FormInputField;

