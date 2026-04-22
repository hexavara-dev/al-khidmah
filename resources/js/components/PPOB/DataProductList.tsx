import { Clock, Database, Moon, Phone, Wifi, Zap } from 'lucide-react';
import type { PricelistItem } from '@/types/PPOB';
import { idr } from '@/lib/PPOB';

function parseDuration(item: PricelistItem): string {
    const combined = `${item.product_details ?? ''} ${item.product_nominal ?? ''}`;
    const m = combined.match(/(\d+)\s*hari/i);
    return m ? `${m[1]} Hari` : '30 Hari';
}

function parseFeature(item: PricelistItem): { text: string; Icon: React.ComponentType<{ className?: string }> } {
    const desc    = item.product_description ?? '';
    const details = item.product_details ?? '';
    const nominal = item.product_nominal ?? '';
    const combined = `${desc} ${details}`.toLowerCase();

    if (/malam|night/i.test(combined)) {
        const timeMatch = details.match(/(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})/);
        return { text: timeMatch ? `${timeMatch[1]} - ${timeMatch[2]}` : 'Malam Hari', Icon: Moon };
    }

    const minMatch = details.match(/(\d+)\s*[Mm]in/);
    const smsMatch = details.match(/(\d+)\s*[Ss][Mm][Ss]/);
    if (minMatch || smsMatch) {
        const parts: string[] = [];
        if (minMatch) parts.push(`${minMatch[1]} Min`);
        if (smsMatch) parts.push(`${smsMatch[1]} SMS`);
        return { text: parts.join(' + '), Icon: Phone };
    }

    const gbMatch = nominal.match(/\d+(?:\.\d+)?\s*(?:GB|MB)/i);
    if (gbMatch) return { text: nominal, Icon: Database };

    const detailFirst = details.split(/[,·|]/)[0]?.trim();
    if (detailFirst) return { text: detailFirst, Icon: Wifi };

    return { text: desc, Icon: Zap };
}

function getBadge(item: PricelistItem, allItems: PricelistItem[]): { label: string; cls: string } | null {
    const combined = `${item.product_description} ${item.product_details}`.toLowerCase();

    if (/malam|night|promo\s+terbatas/i.test(combined)) {
        return { label: 'PROMO TERBATAS', cls: 'bg-orange-400 text-white' };
    }

    const larisItem = allItems.find(i =>
        /sakti|unlimited|terlaris|populer/i.test(i.product_description)
    );
    if (larisItem && larisItem.product_code === item.product_code) {
        return { label: 'PALING LARIS', cls: 'bg-emerald-400 text-white' };
    }

    return null;
}


type Props = {
    items: PricelistItem[];
    selectedItem: PricelistItem | null;
    onSelectItem: (item: PricelistItem) => void;
};

export default function DataProductList({ items, selectedItem, onSelectItem }: Props) {
    return (
        <div>
            {/* Section header */}
            <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">
                Pilihan Terbaik Untukmu
            </h3>

            {items.length === 0 ? (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 py-10">
                    <p className="text-sm text-on-surface-variant">Tidak ada produk tersedia.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(item => {
                        const badge    = getBadge(item, items);
                        const duration = parseDuration(item);
                        const { text: featureText, Icon: FeatureIcon } = parseFeature(item);
                        const isSelected = selectedItem?.product_code === item.product_code;

                        return (
                            <div
                                key={item.product_code}
                                onClick={() => onSelectItem(item)}
                                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-150 ${
                                    isSelected
                                        ? 'border-primary bg-primary-container/20 shadow-sm shadow-primary/10'
                                        : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 hover:bg-surface-container-low'
                                }`}
                            >
                                {/* Top row: badge + price */}
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    {badge ? (
                                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.cls}`}>
                                            {badge.label}
                                        </span>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="shrink-0 text-base font-bold text-primary">
                                        {idr.format(item.product_price)}
                                    </span>
                                </div>

                                {/* Product name */}
                                <p className="font-headline text-base font-bold text-on-surface">
                                    {item.product_description}
                                </p>

                                {/* Meta row */}
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="size-3.5 shrink-0" />
                                        {duration}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <FeatureIcon className="size-3.5 shrink-0" />
                                        {featureText}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
