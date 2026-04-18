import { useState } from 'react';
import { Info, X } from 'lucide-react';
import type { PricelistItem, Operator, Service } from '@/types/ppob';
import { idr, getItemTitle, getItemSubtitle } from '@/lib/ppob';

type Props = {
    items: PricelistItem[];
    selected: Service | null;
    operator: Operator | null;
    onBuy: (item: PricelistItem) => void;
};

function RawJsonDialog({ item, onClose }: { item: PricelistItem; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg rounded-2xl bg-gray-950 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
                    <span className="text-xs font-mono font-semibold text-green-400">{item.product_code}</span>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:text-white hover:bg-gray-800 transition"
                    >
                        <X size={16} />
                    </button>
                </div>
                <pre className="overflow-auto max-h-[60vh] px-5 py-4 text-xs text-gray-200 font-mono leading-relaxed">
                    {JSON.stringify(item, null, 2)}
                </pre>
            </div>
        </div>
    );
}

export default function ProductList({ items, selected, operator, onBuy }: Props) {
    const [inspecting, setInspecting] = useState<PricelistItem | null>(null);

    return (
        <>
            <section id="service-detail-list" className="mx-auto max-w-3xl px-6 pb-20">
                <div className="mb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-green-700">
                        {selected?.label}{operator?.name && <span className="capitalize"> &mdash; {operator.name}</span>}
                    </h2>
                    <p className="mt-1 text-xs text-gray-400">{items.length} produk tersedia</p>
                </div>
                <div className="flex flex-col divide-y divide-green-50 rounded-2xl border border-green-100 bg-white shadow-sm overflow-hidden">
                    {items.length > 0 ? items.map((item) => (
                        <div key={item.product_code} className="flex items-center justify-between px-5 py-4 hover:bg-green-50 transition duration-150">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-semibold text-gray-900">{getItemTitle(item, selected?.type ?? '')}</span>
                                <span className="text-xs text-gray-400 capitalize">{getItemSubtitle(item, selected?.type ?? '')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-green-600">{idr.format(item.product_price)}</span>
                                <button
                                    onClick={() => setInspecting(item)}
                                    title="Lihat data mentah"
                                    className="rounded-lg p-1 text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition"
                                >
                                    <Info size={15} />
                                </button>
                                <button
                                    onClick={() => onBuy(item)}
                                    className="rounded-xl bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700 active:scale-95 transition-all duration-150">
                                    Beli
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="flex items-center justify-center py-10">
                            <p className="text-sm text-gray-500">Tidak ada produk yang cocok dengan nomor tersebut.</p>
                        </div>
                    )}
                </div>
            </section>

            {inspecting && (
                <RawJsonDialog item={inspecting} onClose={() => setInspecting(null)} />
            )}
        </>
    );
}
