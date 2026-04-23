import { FilterConfig } from "./types"

export function applyFilters<T>(
    data: T[],
    filters: Record<string, any>,
    configs: FilterConfig<T>[]
): T[] {
    return data.filter(row =>
        configs.every(config => {
            const value = filters[config.key]
            if (!value) return true
            return config.filterFn(row, value)
        })
    )
}

