import type { PostpaidProvider } from '@/types/ppob';
import { idr } from '@/lib/ppob';

type Props = {
    providers: PostpaidProvider[];
    selected: string | null;
    onSelect: (provider: PostpaidProvider) => void;
};

export default function ProviderSelector({ providers, selected, onSelect }: Props) {
    if (providers.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest py-10 text-center">
                <p className="text-sm text-on-surface-variant">Tidak ada penyedia layanan tersedia saat ini.</p>
            </div>
        );
    }

    return (
        <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                Pilih Penyedia Layanan
            </p>
            <div className="max-h-72 overflow-y-auto rounded-2xl border border-outline-variant/20 pr-1">
                <div className="grid grid-cols-2 gap-2 p-1">
                    {providers.map((p) => {
                        const isSelected = selected === p.code;
                        return (
                            <button
                                key={p.code}
                                onClick={() => onSelect(p)}
                                className={`flex flex-col items-start rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                                    isSelected
                                        ? 'border-primary bg-primary-container text-on-primary-container'
                                        : 'border-outline-variant/20 bg-surface-container-low text-on-surface hover:border-primary/40 hover:bg-surface-container'
                                }`}
                            >
                                <div className="flex w-full items-center gap-2">
                                    <div className={`h-2 w-2 flex-shrink-0 rounded-full ${isSelected ? 'bg-primary' : 'bg-outline-variant'}`} />
                                    <span className="truncate text-xs font-semibold">{p.name}</span>
                                </div>
                                {p.fee > 0 && (
                                    <span className="mt-1 pl-4 text-[10px] text-on-surface-variant">
                                        +{idr.format(p.fee)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
