import PropTypes from "prop-types";

const TabNavigation = ({ title, isActive, isHovered, onHover, onClick }) => {
  return (
    <button
      className={`relative whitespace-nowrap flex items-center pb-1 font-semibold text-sm transition ${
        isActive
          ? "text-blue-700"
          : isHovered
          ? "text-gray-600 dark:text-gray-400"
          : "text-gray-500 dark:text-gray-100"
      }`}
      onMouseEnter={() => onHover(title)}
      onMouseLeave={onHover}
      onClick={() => onClick(title)}
    >
      {title}
      <span
        className={`absolute -bottom-[1.5px] left-0 right-0 h-[1.5px] transition ${
          isActive
            ? "bg-blue-700"
            : isHovered
            ? "bg-gray-500 opacity-100 dark:text-gray-400"
            : "bg-gray-500 opacity-0 group-hover:opacity-100 dark:text-gray-100"
        }`}
      ></span>
    </button>
  );
};

TabNavigation.propTypes = {
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  isHovered: PropTypes.bool.isRequired,
  onHover: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TabNavigation;
