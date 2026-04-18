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
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white py-10 text-center">
                <p className="text-sm text-gray-400">Tidak ada penyedia layanan tersedia saat ini.</p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-700">
                Pilih Penyedia Layanan
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {providers.map((p) => (
                    <button
                        key={p.code}
                        onClick={() => onSelect(p)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                            selected === p.code
                                ? 'border-green-500 bg-green-50 text-green-800 shadow-sm'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${selected === p.code ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="font-medium">{p.name}</span>
                        </div>
                        {p.fee > 0 && (
                            <span className="text-xs text-gray-400">+{idr.format(p.fee)}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
