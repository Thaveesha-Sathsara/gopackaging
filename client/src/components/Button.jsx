import PropTypes from "prop-types";
import { FaSpinner } from "react-icons/fa6";

/**
 * A custom button component for consistent styling throughout the app.
 *
 * @param {string} type - The type of button (e.g. "button", "submit", etc.).
 * @param {function} onClick - The function to call when the button is clicked.
 * @param {React.ReactNode} children - The content of the button.
 * @param {string} variant - The style variant of the button (e.g. "primary", "secondary", etc.).
 * @param {string} size - The size of the button (e.g. "sm", "md", "lg").
 * @param {boolean} isLoading - Whether the button is currently loading.
 * @param {boolean} disabled - Whether the button is disabled.
 * @param {string} className - Additional CSS classes to apply to the button.
 * @param {object} props - Additional props to pass to the button element.
 */
const Button = ({
  type = "button",
  onClick,
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  active = false,
  hidden = false,
  className = "",
  ...props
}) => {
  // Role based visibility
  if (hidden) {
    return null;
  }

  // Base button styles
  const baseStyles =
    "font-semibold transition ease-in-out duration-300 whitespace-nowrap";

  // Variants for different button styles
  const variantStyles = {
    primary: "bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded",
    secondary: "bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded",
    view: "bg-sky-500 hover:bg-sky-600 text-white text-sm px-2 py-1 rounded",
    edit: "bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded",
    delete: "bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1 rounded",
    submit: "bg-blue-600 hover:bg-blue-700 text-white p-3 w-32  rounded-lg",
    login:
      "bg-blue-700 hover:bg-blue-800 text-white px-2 py-2.5 rounded w-full",
    email:
      "flex justify-center items-center gap-3 bg-cyan-500 hover:bg-cyan-600 text-white p-3 w-32 rounded-lg",
    download:
      "bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 p-3 w-40 rounded-lg",
    cancel: "bg-gray-500 hover:bg-gray-600 text-white p-3 w-32 rounded-lg",
    tab: `px-2 py-1 rounded ${
      active ? "bg-blue-700 text-white" : "bg-gray-200 hover:bg-gray-300"
    }`,
    pagination: `px-3 py-1 mx-1 rounded ${
      disabled
        ? "bg-gray-300 text-gray-800 cursor-not-allowed"
        : "bg-blue-700 text-white hover:bg-blue-800"
    }`,
  };

  // Sizes for text and padding
  const sizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Disabled styles
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <FaSpinner className="animate-spin inline text-xl" />
      ) : (
        children
      )}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "view",
    "edit",
    "delete",
    "submit",
    "login",
    "email",
    "download",
    "cancel",
    "tab",
    "pagination",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  hidden: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
