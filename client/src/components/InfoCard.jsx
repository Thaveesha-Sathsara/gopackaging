import { Info } from "lucide-react";
import PropTypes from "prop-types";

const InfoCard = ({ message }) => {
  return (
    <div className="flex flex-col items-center gap-5 bg-white dark:bg-zinc-900 rounded-lg px-24 py-20 w-full max-w-lg">
      <Info className="size-14 text-blue-500" />
      <p className="font-medium dark:text-gray-50">{message}</p>
    </div>
  );
};

InfoCard.propTypes = {
  message: PropTypes.string,
};

export default InfoCard;
