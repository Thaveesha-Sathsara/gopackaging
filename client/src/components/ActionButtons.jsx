import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/src/components/ui/button";
import clsx from "clsx";

const ActionButtons = ({ buttons }) => {
  return (
    <div className="flex gap-2">
      {buttons.map((button, index) => {
        const {
          label,
          onClick,
          to,
          state,
          condition = true,
          variant = "default",
        } = button;

        if (!condition) return null;

        // Handle regular onClick button
        if (onClick) {
          return (
            <Button key={index} onClick={onClick} variant={variant}>
              {label}
            </Button>
          );
        }

        // Handle Link as button
        return (
          <Link
            key={index}
            to={to}
            state={state}
            className={clsx(
              buttonVariants({ variant, size: "default" }),
              // If buttonVariants doesn't apply background, add fallback
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors bg-blue-700 text-white hover:bg-blue-800 dark:bg-[#0018f9] dark:hover:bg-[#000ca5] dark:text-white"
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
};

ActionButtons.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      to: PropTypes.string,
      state: PropTypes.object,
      condition: PropTypes.bool,
      variant: PropTypes.string,
    })
  ).isRequired,
};

export default ActionButtons;
