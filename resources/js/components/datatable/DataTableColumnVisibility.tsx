import { Table } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

interface Props<TData> {
    table: Table<TData>
}

export default function DataTableColumnVisibility<TData>({ table }: Props<TData>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="ml-auto" />}>
                Kustomisasi Kolom <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {table
                    .getAllColumns()
                    .filter(
                        (column) => column.getCanHide()
                    )
                    .map((column) => {
                        const label = typeof column.columnDef.header === "string"
                            ? column.columnDef.header
                            : column.id

                        return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                column.toggleVisibility(!!value)
                                }
                            >
                                {label}
                            </DropdownMenuCheckboxItem>
                        )
                    })
                }
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
