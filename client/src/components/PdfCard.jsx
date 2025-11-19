import PropTypes from "prop-types";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import PdfIcon from "@/assets/pdf-icon.png";

const BASE_URL = import.meta.env.VITE_SERVER_URL_IMG;

export const PdfCard = ({
  pdf,
  onDelete,
  isAllowedDelete,
  subtitlePrefix = "Year: ",
  truncateLength = 30,
}) => {
  // Truncate the name
  const displayName =
    pdf.name.length > truncateLength
      ? `${pdf.name.substring(0, truncateLength)}...`
      : pdf.name;

  // Handle the delete click
  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(pdf); // Pass the entire PDF object back
    }
  };

  return (
    <div className="relative flex items-center w-full h-auto p-6 text-left transition-all duration-300 bg-white border border-gray-200 shadow-md group dark:bg-[#1e1e24] rounded-2xl hover:shadow-lg dark:border-zinc-800">
      {/* Delete button (top-right) */}
      {isAllowedDelete && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-7 h-7 text-gray-500 dark:text-gray-400 dark:hover:bg-zinc-700"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="dark:bg-[#1e1e24] dark:border-zinc-700"
            >
              <DropdownMenuItem
                className="flex items-center gap-2 !text-red-500 dark:!text-red-500 hover:!bg-red-200 focus:!bg-red-200 dark:hover:!bg-red-800/50 dark:focus:!bg-red-800/50 cursor-pointer"
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Content container: icon + info */}
      <div className="flex items-center gap-4 w-full min-w-0">
        <img
          src={PdfIcon}
          alt="PDF"
          className="w-16 h-16 transition-transform duration-200 group-hover:scale-105 flex-shrink-0 rounded-lg"
        />

        {/* Text + buttons */}
        <div className="flex flex-col flex-grow min-w-0">
          <h3
            className="text-base font-medium text-gray-800 dark:text-gray-50"
            title={pdf.name} // Show full name on hover
          >
            {displayName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-50 mb-2">
            {subtitlePrefix}
            {pdf.year}
          </p>

          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <a
                href={`${BASE_URL}${pdf.path}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
            </Button>

            <Button
              asChild
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-700 dark:hover:bg-green-600"
            >
              <a
                href={`${BASE_URL}${pdf.path}`}
                download
                rel="noopener noreferrer"
              >
                Download
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * A skeleton loader for the PdfCard.
 */
export const PdfCardSkeleton = () => (
  <div className="relative flex items-center w-full h-auto p-6 text-left border shadow-md rounded-2xl dark:bg-[#1e1e24] dark:border-zinc-800">
    <div className="flex items-center gap-4 w-full min-w-0">
      <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
      <div className="flex flex-col flex-grow min-w-0"> {/* Added min-w-0 here to fix skeleton layout */}
        <Skeleton className="w-3/4 h-5 mb-2" />
        <Skeleton className="w-1/2 h-4 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-10" />
          <Skeleton className="w-24 h-10" />
        </div>
      </div>
    </div>
  </div>
);

PdfCard.propTypes = {
  pdf: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    path: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  isAllowedDelete: PropTypes.bool.isRequired,
  subtitlePrefix: PropTypes.string,
  truncateLength: PropTypes.number,
};

