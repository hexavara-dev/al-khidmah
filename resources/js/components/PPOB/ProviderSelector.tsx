import type { PostpaidProvider } from "@/types/PPOB";
import { idr } from "@/lib/PPOB";

type Props = {
    providers: PostpaidProvider[];
    selected: string | null;
    onSelect: (provider: PostpaidProvider) => void;
};

export default function ProviderSelector({
    providers,
    selected,
    onSelect,
}: Props) {
    if (providers.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest py-10 text-center">
                <p className="text-sm text-on-surface-variant">
                    Tidak ada penyedia layanan tersedia saat ini.
                </p>
            </div>
        );
    }

    return (
        <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface">
                Pilih Provider
            </p>
            <div className="grid grid-cols-2 gap-3">
                {providers.map((p) => {
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
