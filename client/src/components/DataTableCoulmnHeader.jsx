import PropTypes from "prop-types";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const DataTableColumnHeader = ({ column, title, wordBreak = false }) => {
  if (!column.getCanSort()) {
    return <div className="flex items-center gap-2">{title}</div>;
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-auto w-36 data-[state=open]:bg-accent dark:text-gray-300 dark:hover:text-white transition-colors"
        onClick={column.getToggleSortingHandler()}
      >
        <span
          className={
            wordBreak ? "whitespace-normal break-words text-left text-wrap" : ""
          }
        >
          {title}
        </span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 " size={14} />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2" size={14} />
        ) : (
          <ArrowUpDown className="ml-2" size={14} />
        )}
      </Button>
    </div>
  );
};

DataTableColumnHeader.propTypes = {
  column: PropTypes.object,
  title: PropTypes.string,
  wordBreak: PropTypes.bool,
};

export default DataTableColumnHeader;
