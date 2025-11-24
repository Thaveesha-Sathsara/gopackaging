import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import PropTypes from "prop-types";
import { useState } from "react";
import DataTablePagination from "./DataTablePagination";
import DataTableViewOptions from "./DataTableViewOptions";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

/**
 * A reusable data table component with built-in filtering, sorting, and pagination.
 * 
 * @param {object} props - Component props.
 * @param {array} props.columns - Array of column definitions.
 * @param {array} props.data - Array of table data.
 * @param {number} props.initialPageSize - Initial page size of the table.
 * @param {string} props.title - Table title.
 * @param {string} props.subHeading - Table subheading.
 * @param {array} props.actionButtons - Array of action buttons to display above the table.
 * @param {boolean} props.isLoading - Whether the table is currently loading data.
 * @param {string} props.emptyMessage - Message to display when the table is empty.
 */

const DataTable = ({
  columns,
  data,
  initialPageSize = 10,
  title,
  subHeading,
  actionButtons,
  isLoading = false,
  emptyMessage = "No results.",
}) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
      columnVisibility,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pt-3">
        <div className="flex items-center justify-between pb-3">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-8 w-1/6" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-md border bg-white dark:bg-zinc-900">
          <div className="grid grid-cols-5 gap-4 p-4 border-b">
            {/* Simulated table header */}
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
          <div className="divide-y">
            {/* Simulated table rows */}
            {[...Array(5)].map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-5 gap-4 p-4 items-center"
              >
                {[...Array(5)].map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center ${subHeading ? "pb-3" : "pb-6"}`}>
        {title && (
          <h1 className="text-2xl font-medium text-blue-700 dark:text-gray-200 mr-4">
            {title}
          </h1>
        )}
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm dark:text-gray-200 m-1"
        />
        <DataTableViewOptions table={table} />
        {actionButtons && (
          <div className="ml-4 flex gap-2">{actionButtons}</div>
        )}
      </div>

      {subHeading && (
        <h2 className="text-lg font-medium text-blue-700 dark:text-gray-200 pb-3">
          {subHeading}
        </h2>
      )}

      <ScrollArea>
        <div className="rounded-md border bg-white dark:bg-[#0d0d18] dark:border-[#444557]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="dark:bg-[#1e1f2a] first:rounded-l-md last:rounded-r-md"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="dark:text-gray-200 font-medium"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-16 text-center dark:text-gray-300"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DataTablePagination table={table} />
    </>
  );
};

DataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  initialPageSize: PropTypes.number,
  title: PropTypes.string,
  subHeading: PropTypes.string,
  actionButtons: PropTypes.node,
  isLoading: PropTypes.bool,
  emptyMessage: PropTypes.string,
};

export default DataTable;
