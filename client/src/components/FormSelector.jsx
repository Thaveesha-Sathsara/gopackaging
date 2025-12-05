import PropTypes from "prop-types";
import Selector from "./Selector";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Skeleton } from "./ui/skeleton";

const FormSelector = ({
  form,
  name,
  label,
  placeholder,
  options,
  isMulti = false,
  required = false,
  isLoading = false,
}) => {
  return (
    <FormField
      control={form.control}
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
              <Selector
                inputId={name}
                name={name}
                options={options}
                value={field.value}
                onChange={field.onChange}
                placeholder={placeholder}
                isMulti={isMulti}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

FormSelector.propTypes = {
  form: PropTypes.object,
  name: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.array,
  isMulti: PropTypes.bool,
  required: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default FormSelector;
