import type { PricelistItem, Operator, Service } from '@/types/ppob';
import { idr, getItemTitle, getItemSubtitle } from '@/lib/ppob';

type Props = {
    items: PricelistItem[];
    selected: Service | null;
    operator: Operator | null;
    onBuy: (item: PricelistItem) => void;
};

export default function ProductList({ items, selected, operator, onBuy }: Props) {
    return (
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
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-green-600">{idr.format(item.product_price)}</span>
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
    );
}
