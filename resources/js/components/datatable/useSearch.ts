import { SearchConfig } from "./types"

// Helper function to get nested property value using dot notation
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

export function applySearch<T extends object>(
    data: T[],
    searchValue: string,
    configs: SearchConfig<T>[] = []
): T[] {
    if (!searchValue || configs.length === 0) return data

    const keyword = searchValue.toLowerCase()

    return data.filter(row =>
        configs.some(config => {
            let keys: string[] = []

            if (config.mode === "global") {
                keys = Object.keys(row)
            }

            if (config.mode === "single" || config.mode === "multiple") {
                if (!config.keys) return false
                keys = config.keys as string[]
            }

            return keys.some(key => {
                // Support nested properties with dot notation
                const value = key.includes('.')
                    ? getNestedValue(row, key)
                    : row[key as keyof T]

                if (value == null) return false
                return String(value).toLowerCase().includes(keyword)
            })
        })
    )
}
