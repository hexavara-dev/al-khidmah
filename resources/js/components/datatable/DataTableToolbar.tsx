import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import DateRangePicker from "../DateRangePicker"
import { FilterConfig } from "./types"

export function DataTableToolbar({ filters, setFilters, configs }: {
    filters: Record<string, any>,
    setFilters: React.Dispatch<React.SetStateAction<Record<string, any>>>,
    configs: FilterConfig<any>[],
}) {
    return (
        <div className="flex gap-2">
            {configs.map(filter => {
                switch(filter.type) {
                    case "select":
                        return (
                            <Select
                                key={filter.key}
                                value={filters[filter.key]}
                                onValueChange={(v: string | null) =>
                                    setFilters(prev => ({
                                        ...prev,
                                        [filter.key]: v,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder={filter.label} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filter.options.map(option => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )

                    case "date-range":
                        return (
                            <DateRangePicker
                                key={filter.key}
                                value={filters[filter.key]}
                                onChange={(date) =>
                                    setFilters(prev => ({
                                        ...prev,
                                    [filter.key]: date,
                                }))}
                            />
                        )

                    default:
                        return null
                }
            })}
        </div>
    )
}
