import Select from "react-select";
import PropTypes from "prop-types";
import { useTheme } from "./ThemeProvider";

const Selector = ({
  inputId,
  name,
  value, // Current value(s) in the form
  options, // List of options for Select
  onChange, // Change handler
  isMulti = false, // Multi-select toggle
  placeholder = "Select an option", // Default placeholder
  isClearable = true,
  isDisabled = false, // Disabled toggle
  className,
}) => {
  const { theme: appTheme } = useTheme();

  const selectedValue = isMulti
    ? options?.filter((option) =>
        value?.includes(option?.value?._id || option?.value)
      )
    : options?.find(
        (option) => option?.value?._id === value || option?.value === value
      );

  const handleChange = (selectedOption) => {
    const newValue = isMulti
      ? selectedOption
        ? selectedOption.map((option) => option?.value?._id || option?.value)
        : []
      : selectedOption
      ? selectedOption?.value?._id || selectedOption?.value
      : "";
    onChange(newValue, name);
  };

  return (
    <Select
      inputId={inputId}
      name={name}
      value={selectedValue || (isMulti ? [] : "")}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      isSearchable={true}
      isClearable={isClearable}
      isMulti={isMulti}
      isDisabled={isDisabled}
      menuPlacement="auto"
      menuPosition="fixed"
      className={`${className} text-sm`}
      styles={{
        menu: (styles) => ({
          ...styles,
          backgroundColor: appTheme === "dark" ? "#27272a" : "white",
          color: appTheme === "dark" ? "white" : "black",
          className: "dark:text-[#ffffff] dark:placeholder:text-[#8f8fa3] dark:bg-[#33343f] dark:border-[#33343f]",
        }),
      }}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: appTheme === "dark" ? "white" : "#2684FF", // Selected
          primary25: appTheme === "dark" ? "#3f3f46" : "#DEEBFF", // Hover
          primary50: appTheme === "dark" ? "#52525b" : "#B2D4FF", // Focus
          neutral0: appTheme === "dark" ? "#0d0d18" : "white", // Background
          neutral10: appTheme === "dark" ? "#33343f" : "#e5e7eb",
          neutral20: appTheme === "dark" ? "#33343f" : "#33343f", // Border
          neutral80: appTheme === "dark" ? "#ffffff" : "#111827", // Text
        },
      })}
    />
  );
};

Selector.propTypes = {
  inputId: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.any, // Current value(s) in the form
  options: PropTypes.array, // List of options for Select
  onChange: PropTypes.func, // Change handler
  isMulti: PropTypes.bool, // Multi-select toggle
  placeholder: PropTypes.string, // Default placeholder
  isClearable: PropTypes.bool,
  isDisabled: PropTypes.bool, // Disabled toggle
  className: PropTypes.string,
};

export default Selector;
