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
          <FormLabel className="text-gray-800">
            {label}{" "}
            {required && (
              <span className="text-red-600">*</span>
            )}
          </FormLabel>
          <FormControl>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                type={type}
                className="text-gray-950"
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
          <FormLabel className="text-gray-800">
            {label}{" "}
            {required && (
              <span className="text-red-600">*</span>
            )}
          </FormLabel>
          <FormControl>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                type={type}
                className="text-gray-950"
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

