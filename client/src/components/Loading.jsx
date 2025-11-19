import { Cog } from "lucide-react";
import PropTypes from "prop-types";

const Loading = ({ size = "size-10", height = "h-screen" }) => {
  return (
    <div
      className={`flex items-center justify-center ${height} overflow-hidden bg-white dark:bg-gray-950`}
    >
      <Cog className={`animate-spin text-blue-500 dark:text-gray-50 ${size}`} />
    </div>
  );
};

Loading.propTypes = {
  size: PropTypes.string,
  height: PropTypes.string,
};

export default Loading;
