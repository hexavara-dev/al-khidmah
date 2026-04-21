import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { FilterConfig, SearchConfig } from "./types"
import { Button } from "../ui/button"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import React from "react"
import { Input } from "../ui/input"
import { applyFilters } from "./useFilter"
import { applySearch } from "./useSearch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DataTableColumnVisibility from "./DataTableColumnVisibility"
import { cn } from "@/lib/utils"
import { DataTableToolbar } from "./DataTableToolbar"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pagination?: boolean
    rowsPerPageOptions?: number[],
    search?: SearchConfig,
    filters?: FilterConfig<TData>[],
    visibility?: boolean,

    selectRow?: keyof TData,

    onRowSelect?: (row: TData) => void,
    onSelectRowChange?: (key: TData[keyof TData] | null) => void,
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pagination,
    search: searchConfig,
    filters: filterConfigs,
    visibility,
    selectRow,
    onRowSelect,
    onSelectRowChange,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [filters, setFilters] = React.useState<Record<string, any>>(
        () => {
            const defaultFilters: Record<string, any> = {}
            filterConfigs?.forEach(config => {
                if (config.defaultValue) {
                    defaultFilters[config.key] = config.defaultValue
                }
            })
            return defaultFilters
        }
    );
    const [searchValue, setSearchValue] = React.useState<string>("");
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    // const [selectedRow, setSelectedRow] = React.useState<string>("");
    const [selectedRowKey, setSelectedRowKey] = React.useState<TData[keyof TData] | null>(null)

    // const filteredData = React.useMemo(() => {
    //     if (!filterConfigs?.length) return data

    //     return data.filter(row =>
    //         filterConfigs.every(config => {
    //             const value = filters[config.key]
    //             if (!value) return true
    //             return config.filterFn(row, value)
    //         })
    //     )
    // }, [data, filters, filterConfigs]);

    const searchData = React.useMemo(() => {
        const afterFilter = applyFilters(data, filters, filterConfigs ?? [])
        return applySearch(afterFilter, searchValue, searchConfig ? [searchConfig] : [])
    }, [data, filters, filterConfigs, searchValue, searchConfig])

    const table = useReactTable({
        data: searchData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: pagination
            ? getPaginationRowModel()
            : undefined,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnVisibility,
            // columnFilters,
        },
    })

    return (
        <div>
            <div
                className={cn(
                    "flex items-center py-4",
                    filterConfigs?.length && "gap-4",
                    visibility && "justify-between"
                )}
            >
                {searchConfig && (
                    <Input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder={searchConfig.placeholder ?? "Search..."}
                        className="max-w-sm"
                    />
                )}
                {filterConfigs?.length && (
                    <DataTableToolbar
                        filters={filters}
                        setFilters={setFilters}
                        configs={filterConfigs}
                    />
                )}
                {visibility && <DataTableColumnVisibility table={table} />}
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                    )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={
                                    selectRow &&
                                    selectedRowKey === row.original[selectRow]
                                        ? "selected"
                                        : undefined
                                }
                                onClick={() => {
                                    if (!selectRow) return

                                    const key = row.original[selectRow];

                                    setSelectedRowKey(key)
                                    onSelectRowChange?.(key)
                                    onRowSelect?.(row.original)
                                }}
                                className={selectRow ? "cursor-pointer" : undefined}
                            >
                                {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                                ))}
                            </TableRow>
                        ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Tidak ada data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {pagination && (
                <div className="flex items-center justify-between py-4">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} sampai{" "}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                        )}{" "}
                        dari {table.getFilteredRowModel().rows.length} entri
                    </div>
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Baris per halaman</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value: string | null) => {
                            table.setPageSize(Number(value ?? 10))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                            {[10, 25, 50, 75, 100].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
