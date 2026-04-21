import * as React from "react"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface DateRange {
    from: string | null
    to: string | null
}

interface DateRangePickerProps {
    value?: DateRange
    onChange?: (value: DateRange) => void
    className?: string
}

export default function DateRangePicker({
    value,
    onChange,
    className,
}: DateRangePickerProps) {
    const handleFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.({ from: e.target.value || null, to: value?.to ?? null })
    }

    const handleTo = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.({ from: value?.from ?? null, to: e.target.value || null })
    }

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <div className="relative flex items-center">
                <CalendarIcon className="absolute left-2 size-3.5 text-muted-foreground" />
                <input
                    type="date"
                    value={value?.from ?? ""}
                    onChange={handleFrom}
                    className="h-8 rounded-lg border border-input bg-background pl-7 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
            <span className="text-muted-foreground text-sm">—</span>
            <div className="relative flex items-center">
                <CalendarIcon className="absolute left-2 size-3.5 text-muted-foreground" />
                <input
                    type="date"
                    value={value?.to ?? ""}
                    onChange={handleTo}
                    className="h-8 rounded-lg border border-input bg-background pl-7 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
        </div>
    )
}
