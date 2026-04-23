import { useState } from "react";
import type { PostpaidProvider } from "@/types/PPOB";
import { idr } from "@/lib/PPOB";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
    providers: PostpaidProvider[];
    selected: string | null;
    onSelect: (provider: PostpaidProvider) => void;
};

function getBrand(code: string): string {
    return code.replace(/\d+[A-Z]?$/, "") || code;
}

function getBrandLabel(brand: string, items: PostpaidProvider[]): string {
    if (items.length === 1) return items[0].name;
    const first = items[0].name.toUpperCase().replace(/\s+/g, " ").trim();
    const words = first.split(" ");
    const common = words.filter((w) =>
        items.every((p) => p.name.toUpperCase().includes(w)),
    );
    return common.length > 0 ? common.join(" ") : brand;
}

export default function ProviderSelector({
    providers,
    selected,
    onSelect,
}: Props) {
    const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

    if (providers.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest py-10 text-center">
                <p className="text-sm text-on-surface-variant">
                    Tidak ada penyedia layanan tersedia saat ini.
                </p>
            </div>
        );
    }

    const grouped = providers.reduce<Record<string, PostpaidProvider[]>>(
        (acc, p) => {
            const brand = getBrand(p.code);
            if (!acc[brand]) acc[brand] = [];
            acc[brand].push(p);
            return acc;
        },
        {},
    );

    const brands = Object.keys(grouped);

    if (expandedBrand) {
        const items = grouped[expandedBrand];
        const label = getBrandLabel(expandedBrand, items);

        return (
            <div>
                <button
                    onClick={() => setExpandedBrand(null)}
                    className="mb-3 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary transition hover:opacity-70"
                >
                    <ChevronLeft className="size-3.5" />
                    Kembali
                </button>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface">
                    {label}
                </p>
                <div className="grid grid-cols-2 gap-3">
                    {items.map((p) => {
                        const isSelected = selected === p.code;
                        return (
                            <button
                                key={p.code}
                                onClick={() => onSelect(p)}
                                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-5 text-center transition ${
                                    isSelected
                                        ? "border-[2.5px] border-primary bg-primary-container/20 shadow-md shadow-primary/10"
                                        : "border border-outline-variant/20 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container"
                                }`}
                            >
                                <p
                                    className={`text-sm font-bold leading-tight ${isSelected ? "text-primary" : "text-on-surface"}`}
                                >
                                    {p.name}
                                </p>
                                {p.fee > 0 && (
                                    <span className="text-[10px] text-on-surface-variant">
                                        +{idr.format(p.fee)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface">
                Pilih Provider
            </p>
            <div className="grid grid-cols-2 gap-3">
                {brands.map((brand) => {
                    const items = grouped[brand];
                    const isSingle = items.length === 1;
                    const isSelected = isSingle && selected === items[0].code;
                    const label = getBrandLabel(brand, items);

                    return (
                        <button
                            key={brand}
                            onClick={() => {
                                if (isSingle) {
                                    onSelect(items[0]);
                                } else {
                                    setExpandedBrand(brand);
                                }
                            }}
                            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-5 text-center transition ${
                                isSelected
                                    ? "border-[2.5px] border-primary bg-primary-container/20 shadow-md shadow-primary/10"
                                    : "border border-outline-variant/20 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container"
                            }`}
                        >
                            <p
                                className={`text-sm font-bold leading-tight ${isSelected ? "text-primary" : "text-on-surface"}`}
                            >
                                {label}
                            </p>
                            {isSingle && items[0].fee > 0 && (
                                <span className="text-[10px] text-on-surface-variant">
                                    +{idr.format(items[0].fee)}
                                </span>
                            )}
                            {!isSingle && (
                                <span className="flex items-center gap-0.5 text-[10px] text-on-surface-variant">
                                    {items.length} layanan
                                    <ChevronRight className="size-3" />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
