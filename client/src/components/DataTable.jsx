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
 * * @param {object} props - Component props.
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
        <div className="rounded-md border bg-white overflow-hidden">
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
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            {title && (
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {title}
            </h1>
            )}
            {subHeading && (
            <h2 className="text-sm font-medium text-gray-500 mt-1">
                {subHeading}
            </h2>
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
            <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full sm:w-[250px] bg-white"
            />
            <div className="flex gap-2">
                <DataTableViewOptions table={table} />
                {actionButtons}
            </div>
        </div>
      </div>

      {/* ScrollArea Container
        - 'flex-1' ensures it takes up available vertical space if parent is a flex col.
        - 'border rounded-md' gives the table its box.
        - 'bg-white' ensures readable background.
      */}
      <ScrollArea className="flex-1 w-full max-w-[100vw] rounded-md border bg-white">
        {/* Horizontal ScrollBar:
          This enables the specific customized horizontal scrolling behavior 
          provided by shadcn/ui.
        */}
        <ScrollBar orientation="horizontal" />
        
        <Table className="min-w-[800px] w-full">
            {/* Suggestion: 'min-w-[800px]' 
               This forces the table to be at least 800px wide. 
               On mobile (<800px), this triggers the horizontal scroll.
            */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/50 hover:bg-gray-50/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-10 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-700"
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
                  className="h-24 text-center text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <DataTablePagination table={table} />
    </div>
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