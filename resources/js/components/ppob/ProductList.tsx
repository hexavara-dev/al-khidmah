import type { PricelistItem, Operator, Service, PlnCustomer } from '@/types/ppob';
import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { idr, getItemTitle, getItemSubtitle } from '@/lib/ppob';

type Props = {
    items: PricelistItem[];
    selected: Service | null;
    operator: Operator | null;
    onBuy: (item: PricelistItem) => void;
    customerNumber?: string;
    plnCustomer?: PlnCustomer | null;
};

const cardLabels: Record<string, string> = {
    pulsa:  'Pulsa',
    data:   'Data',
    pln:    'Token',
    etoll:  'Top-up',
};

function RawJsonDialog({ item, onClose }: { item: PricelistItem; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-gray-950 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-gray-800 px-5 py-3">
                    <span className="font-mono text-xs font-semibold text-primary">{item.product_code}</span>
                    <button onClick={onClose} className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-800 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
                <pre className="max-h-[60vh] overflow-auto px-5 py-4 font-mono text-xs leading-relaxed text-gray-200">
                    {JSON.stringify(item, null, 2)}
                </pre>
            </div>
        </div>
    );
}

export default function ProductList({ items, selected, operator, onBuy, customerNumber, plnCustomer }: Props) {
    const [inspecting, setInspecting] = useState<PricelistItem | null>(null);
    const [selectedItem, setSelectedItem] = useState<PricelistItem | null>(null);

    const cardLabel = cardLabels[selected?.type ?? ''] ?? selected?.label ?? '';

    const handleSelect = (item: PricelistItem) => {
        setSelectedItem(item);
    };

    return (
        <>
            {/* PLN / customer info */}
            {selected?.type === 'pln' && plnCustomer && (
                <div className="mb-4 rounded-2xl border border-primary/20 bg-primary-container/30 px-4 py-3 text-xs text-on-surface space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Informasi Pelanggan</p>
                    {plnCustomer.name && <p><span className="text-on-surface-variant">Nama:</span> <span className="font-semibold">{plnCustomer.name}</span></p>}
                    {plnCustomer.meter_no && <p><span className="text-on-surface-variant">No. Meter:</span> <span className="font-semibold">{plnCustomer.meter_no}</span></p>}
                    {plnCustomer.segment_power && <p><span className="text-on-surface-variant">Tarif / Daya:</span> <span className="font-semibold">{plnCustomer.segment_power}</span></p>}
                </div>
            )}
            {selected?.type === 'pln' && customerNumber && !plnCustomer && (
                <p className="mb-3 text-xs text-on-surface-variant">
                    ID Pelanggan: <span className="font-semibold text-on-surface">{customerNumber}</span>
                </p>
            )}

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h4 className="font-headline text-sm font-bold text-on-surface">
                        Pilih Nominal{operator?.name && <span className="capitalize font-normal text-on-surface-variant"> — {operator.name}</span>}
                    </h4>
                    <p className="mt-0.5 text-xs text-on-surface-variant">{items.length} produk tersedia</p>
                </div>
                <button
                    className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container"
                    title="Info produk"
                >
                    <Info size={16} />
                </button>
            </div>

            {/* 2-column product grid */}
            {items.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {items.map((item) => {
                        const isSelected = selectedItem?.product_code === item.product_code;
                        return (
                            <div
                                key={item.product_code}
                                onClick={() => handleSelect(item)}
                                className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-150 ${
                                    isSelected
                                        ? 'border-primary bg-primary-container/40 shadow-sm shadow-primary/10'
                                        : 'border-outline-variant/20 bg-surface-container-low hover:border-primary/40 hover:bg-surface-container'
                                }`}
                            >
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                    {cardLabel}
                                </p>
                                <p className="text-xl font-bold text-on-surface leading-tight">
                                    {getItemTitle(item, selected?.type ?? '')}
                                </p>
                                <p className="mt-1 text-xs text-on-surface-variant leading-tight line-clamp-2">
                                    {getItemSubtitle(item, selected?.type ?? '')}
                                </p>
                                <p className="mt-2 text-sm font-bold text-primary">
                                    {idr.format(item.product_price)}
                                </p>

                                {/* Raw JSON button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setInspecting(item); }}
                                    className="absolute right-2 top-2 rounded-lg p-1 text-outline-variant opacity-0 transition hover:text-primary group-hover:opacity-100"
                                    title="Lihat data mentah"
                                >
                                    <Info size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 py-10">
                    <p className="text-sm text-on-surface-variant">Tidak ada produk yang cocok dengan nomor tersebut.</p>
                </div>
            )}

            {/* CTA if item selected */}
            {selectedItem && (
                <div className="mt-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-on-surface-variant">Dipilih</p>
                            <p className="font-headline text-sm font-bold text-on-surface">{getItemTitle(selectedItem, selected?.type ?? '')}</p>
                        </div>
                        <p className="text-base font-bold text-primary">{idr.format(selectedItem.product_price)}</p>
                    </div>
                    <button
                        onClick={() => onBuy(selectedItem)}
                        className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-on-primary transition hover:bg-primary-dim active:scale-[0.98]"
                    >
                        Lanjutkan ke Pembayaran →
                    </button>
                </div>
            )}

            {inspecting && (
                <RawJsonDialog item={inspecting} onClose={() => setInspecting(null)} />
            )}
        </>
    );
}
