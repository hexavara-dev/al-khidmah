export type SearchConfig<TData = any> = {
    mode: "single" | "multiple" | "global"
    keys?: (keyof TData | string)[]
    placeholder?: string
}

export type FilterOption = {
    label: React.ReactNode
    value: string
}

export type FilterConfig<TData = any> =
    | {
        type: "select"
        key: string
        label: string
        options: FilterOption[]
        filterFn: (row: TData, value: string) => boolean
        defaultValue?: string
    }
    | {
        type: "date-range"
        key: string
        label: string
        filterFn: (row: TData, value: any) => boolean
        defaultValue?: { from: Date; to: Date }
    }
