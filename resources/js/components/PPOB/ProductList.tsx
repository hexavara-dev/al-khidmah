import type {
    PricelistItem,
    Operator,
    Service,
    PlnCustomer,
} from "@/types/PPOB";
import { useState } from "react";
import {
    Info,
    X,
    Clock,
    Wifi,
    Globe,
    Tv,
    Zap,
    MessageSquare,
    Phone,
} from "lucide-react";
import { idr, getItemTitle, getItemSubtitle } from "@/lib/PPOB";

type Props = {
    items: PricelistItem[];
    selected: Service | null;
    operator: Operator | null;
    onBuy: (item: PricelistItem) => void;
    customerNumber?: string;
    plnCustomer?: PlnCustomer | null;
    selectedItem?: PricelistItem | null;
    onSelectItem?: (item: PricelistItem) => void;
};

const cardLabels: Record<string, string> = {
    pulsa: "Pulsa",
    data: "Data",
    pln: "Token",
    etoll: "Top-up",
};


// ── Badge logic ──────────────────────────────────────────────────────────────
type BadgeType = "paling_laris" | "promo_terbatas" | "hemat" | "baru" | null;

function getBadge(
    item: PricelistItem,
    index: number,
    allItems: PricelistItem[],
): BadgeType {
    const desc = (
        item.product_description +
        " " +
        item.product_nominal
    ).toLowerCase();
    if (/bonus|promo|spesial|special/i.test(desc)) return "promo_terbatas";
    // if (index === 0 && allItems.length > 2) return "paling_laris";
    // Items with lowest price-per-GB (heuristic: largest GB at moderate price)
    const gbMatch = desc.match(/(\d+)\s*gb/i);
    if (gbMatch) {
        const gb = parseInt(gbMatch[1]);
        const pricePerGb = item.product_price / gb;
        if (pricePerGb < 2500 && gb >= 20) return "hemat";
    }
    return null;
}

// ── Parse detail chips from product fields ───────────────────────────────────
type Chip = { icon: React.ReactNode; label: string };

function parseChips(item: PricelistItem): Chip[] {
    const chips: Chip[] = [];
    const combined = (
        item.product_description +
        " " +
        item.product_nominal +
        " " +
        (item.product_details ?? "")
    ).toLowerCase();

    // Duration
    const hariMatch = combined.match(/(\d+)\s*hari/i);
    if (hariMatch)
        chips.push({
            icon: <Clock size={11} />,
            label: `${hariMatch[1]} Hari`,
        });

    // Quota info — malam / time-limited
    const malamMatch = combined.match(/(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})/);
    if (malamMatch)
        chips.push({
            icon: <Clock size={11} />,
            label: `${malamMatch[1]} - ${malamMatch[2]}`,
        });

    // Network type
    if (/4g|lte/i.test(combined))
        chips.push({ icon: <Zap size={11} />, label: "4G/LTE" });
    else if (/semua jaringan|all network/i.test(combined))
        chips.push({ icon: <Zap size={11} />, label: "Semua Jaringan" });

    // GB breakdown (e.g. "45GB + 5GB Chat")
    const bonusMatch = item.product_nominal?.match(
        /(\d+\s*GB)\s*\+\s*([\d]+\s*GB[^,)]*)/i,
    );
    if (bonusMatch) {
        chips.push({ icon: <Wifi size={11} />, label: bonusMatch[1] });
        chips.push({ icon: <MessageSquare size={11} />, label: bonusMatch[2] });
    } else {
        // Plain GB
        const gbMatch = item.product_nominal?.match(/(\d+\s*GB)/i);
        if (gbMatch && !bonusMatch)
            chips.push({ icon: <Wifi size={11} />, label: gbMatch[1] });
    }

    // Menit / SMS combo
    const menitMatch = combined.match(/(\d+)\s*min(?:it)?/i);
    if (menitMatch)
        chips.push({
            icon: <Phone size={11} />,
            label: `${menitMatch[1]} Min`,
        });
    const smsMatch = combined.match(/(\d+)\s*sms/i);
    if (smsMatch)
        chips.push({
            icon: <MessageSquare size={11} />,
            label: `${smsMatch[1]} SMS`,
        });

    // Roaming
    if (/roaming/i.test(combined))
        chips.push({ icon: <Globe size={11} />, label: "Roaming" });

    // Streaming
    if (/youtube/i.test(combined))
        chips.push({ icon: <Tv size={11} />, label: "YouTube" });
    if (/spotify/i.test(combined))
        chips.push({ icon: <Tv size={11} />, label: "Spotify" });

    return chips.slice(0, 4); // max 4 chips per card
}

// ── Badge component ───────────────────────────────────────────────────────────
function Badge({ type }: { type: BadgeType }) {
    if (!type) return null;
    const map: Record<
        NonNullable<BadgeType>,
        { label: string; className: string }
    > = {
        paling_laris: {
            label: "PALING LARIS",
            className: "bg-emerald-500 text-white",
        },
        promo_terbatas: {
            label: "PROMO TERBATAS",
            className: "bg-orange-400 text-white",
        },
        hemat: { label: "HEMAT", className: "bg-sky-500 text-white" },
        baru: { label: "BARU", className: "bg-violet-500 text-white" },
    };
    const { label, className } = map[type];
    return (
        <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${className}`}
        >
            {label}
        </span>
    );
}

// ── Raw JSON dialog ───────────────────────────────────────────────────────────
function RawJsonDialog({
    item,
    onClose,
}: {
    item: PricelistItem;
    onClose: () => void;
}) {
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
                    <span className="font-mono text-xs font-semibold text-primary">
                        {item.product_code}
                    </span>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                    >
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

// ── 1-column card for data packages ──────────────────────────────────────────
function DataCard({
    item,
    index,
    allItems,
    isSelected,
    onSelect,
    onInspect,
}: {
    item: PricelistItem;
    index: number;
    allItems: PricelistItem[];
    isSelected: boolean;
    onSelect: () => void;
    onInspect: () => void;
}) {
    const badge = getBadge(item, index, allItems);
    const chips = parseChips(item);

    return (
        <div
            onClick={onSelect}
            className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-150 ${
                isSelected
                    ? "border-primary bg-primary-container/30 shadow-md shadow-primary/10"
                    : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 hover:bg-surface-container"
            }`}
        >
            {/* Top row: badge + price */}
            <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1.5">
                    {badge && <Badge type={badge} />}
                    <p
                        className={`text-[15px] font-bold leading-snug ${isSelected ? "text-primary" : "text-on-surface"}`}
                    >
                        {item.product_nominal || item.product_description}
                    </p>
                </div>
                <p
                    className={`shrink-0 text-base font-bold ${isSelected ? "text-primary" : "text-primary"}`}
                >
                    {idr.format(item.product_price)}
                </p>
            </div>

            {/* Chips row */}
            {chips.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {chips.map((chip, i) => (
                        <span
                            key={i}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                isSelected
                                    ? "bg-primary/10 text-primary"
                                    : "bg-surface-container text-on-surface-variant"
                            }`}
                        >
                            {chip.icon}
                            {chip.label}
                        </span>
                    ))}
                </div>
            )}

            {/* Raw JSON button (hidden until hover) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onInspect();
                }}
                className="absolute right-3 top-3 rounded-lg p-1 text-outline-variant opacity-0 transition group-hover:opacity-100 hover:text-primary"
                title="Lihat data mentah"
            >
                <Info size={12} />
            </button>

            {/* Selected indicator dot */}
            {isSelected && (
                <span className="absolute right-3 bottom-3 h-2 w-2 rounded-full bg-primary" />
            )}
        </div>
    );
}

// ── Helpers for pulsa grid card ───────────────────────────────────────────────
function getPulsaPromo(item: PricelistItem): boolean {
    const desc = (
        item.product_description +
        " " +
        item.product_nominal
    ).toLowerCase();
    return /bonus|promo|spesial|special|diskon/i.test(desc);
}

/** For pulsa: nominal is the "face value", price is what user pays.
 *  We show nominal as strikethrough "harga normal" and price as actual. */
function getPulsaNominalValue(item: PricelistItem): number | null {
    const num = parseInt(item.product_nominal?.replace(/\D/g, "") ?? "");
    if (isNaN(num) || num < 1000) return null;
    // Only show strikethrough if nominal > price (shouldn't happen) or we fabricate
    // a "normal price" = product_price + small markup to simulate original price
    // Based on screenshot: Rp 6.500 crossed, Rp 6.100 actual → nominal 5000, price ~6100
    // So "normal" = nominal + round markup (about 30% of nominal or fixed)
    return num;
}

// ── 2-column card for pulsa / pln / etoll ────────────────────────────────────
function GridCard({
    item,
    cardLabel,
    serviceType,
    isSelected,
    isPageMode,
    onSelect,
    onInspect,
}: {
    item: PricelistItem;
    cardLabel: string;
    serviceType: string;
    isSelected: boolean;
    isPageMode: boolean;
    onSelect: () => void;
    onInspect: () => void;
}) {
    const isPageSelected = isSelected && isPageMode;
    const isPulsa = serviceType === "pulsa";
    const isPromo = isPulsa && getPulsaPromo(item);
    const nominalValue = isPulsa ? getPulsaNominalValue(item) : null;

    // "Normal price" = nominal + standard markup shown as crossed price
    // e.g. nominal 5000 → normal price shown as nominal+1500 rounded
    const normalPrice = nominalValue
        ? Math.ceil((nominalValue * 1.3) / 500) * 500
        : null;

    return (
        <div
            onClick={onSelect}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-150 ${
                isSelected
                    ? "border-[2.5px] border-primary bg-primary-container/20 shadow-md shadow-primary/15"
                    : "border border-outline-variant/20 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container"
            }`}
        >
            {/* PROMO ribbon — diagonal top-right */}
            {isPromo && (
                <div
                    className="pointer-events-none absolute right-0 top-0 overflow-hidden rounded-tr-2xl"
                    style={{ width: 56, height: 56 }}
                >
                    <div
                        className="absolute bg-primary text-on-primary"
                        style={{
                            top: 10,
                            right: -18,
                            width: 72,
                            textAlign: "center",
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            padding: "2px 0",
                            transform: "rotate(45deg)",
                        }}
                    >
                        PROMO
                    </div>
                </div>
            )}

            {/* Card label */}
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {cardLabel}
            </p>

            {/* Nominal (face value) — large */}
            <p className="text-xl font-bold leading-tight text-on-surface">
                {getItemTitle(item, serviceType)}
            </p>

            {/* Price section */}
            {isPulsa && normalPrice ? (
                <div className="mt-2 flex flex-col gap-0.5">
                    <p className="text-xs text-on-surface-variant line-through">
                        {idr.format(normalPrice)}
                    </p>
                    <p className="text-sm font-bold text-primary">
                        {idr.format(item.product_price)}
                    </p>
                </div>
            ) : (
                <>
                    <p className="mt-1 text-xs leading-tight line-clamp-2 text-on-surface-variant">
                        {getItemSubtitle(item, serviceType)}
                    </p>
                    <p className="mt-2 text-sm font-bold text-primary">
                        {idr.format(item.product_price)}
                    </p>
                </>
            )}

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onInspect();
                }}
                className="absolute right-2 bottom-2 rounded-lg p-1 text-outline-variant opacity-0 transition group-hover:opacity-100 hover:text-primary"
                title="Lihat data mentah"
            >
                <Info size={12} />
            </button>
        </div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ProductList({
    items,
    selected,
    operator,
    onBuy,
    customerNumber,
    plnCustomer,
    selectedItem: externalSelected,
    onSelectItem,
}: Props) {
    const [inspecting, setInspecting] = useState<PricelistItem | null>(null);
    const [internalSelected, setInternalSelected] =
        useState<PricelistItem | null>(null);
    const isPageMode = !!onSelectItem;
    const selectedItem = isPageMode
        ? (externalSelected ?? null)
        : internalSelected;
    const isDataService = selected?.type === "data";

    const handleSelect = (item: PricelistItem) => {
        if (isPageMode) {
            onSelectItem!(item);
        } else {
            setInternalSelected(item);
        }
    };

    const cardLabel = cardLabels[selected?.type ?? ""] ?? selected?.label ?? "";

    const filteredItems = items;

    return (
        <>




            {/* ── Product list ── */}
            {filteredItems.length > 0 ? (
                isDataService ? (
                    /* 1-column list for data */
                    <div className="flex flex-col gap-3">
                        {filteredItems.map((item, idx) => (
                            <DataCard
                                key={item.product_code}
                                item={item}
                                index={idx}
                                allItems={filteredItems}
                                isSelected={
                                    selectedItem?.product_code ===
                                    item.product_code
                                }
                                onSelect={() => handleSelect(item)}
                                onInspect={() => setInspecting(item)}
                            />
                        ))}
                    </div>
                ) : (
                    /* 2-column grid for everything else */
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {filteredItems.map((item) => (
                            <GridCard
                                key={item.product_code}
                                item={item}
                                cardLabel={cardLabel}
                                serviceType={selected?.type ?? ""}
                                isSelected={
                                    selectedItem?.product_code ===
                                    item.product_code
                                }
                                isPageMode={isPageMode}
                                onSelect={() => handleSelect(item)}
                                onInspect={() => setInspecting(item)}
                            />
                        ))}
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 py-10 gap-2">
                    <p className="text-sm font-semibold text-on-surface">
                        Tidak ada produk
                    </p>
                    <p className="text-xs text-on-surface-variant">
                        {isDataService
                            ? "Tidak ada paket di kategori ini."
                            : "Tidak ada produk yang cocok dengan nomor tersebut."}
                    </p>
                </div>
            )}

            {/* ── Inline CTA (non-page mode) ── */}
            {!isPageMode && selectedItem && (
                <div className="mt-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-on-surface-variant">
                                Dipilih
                            </p>
                            <p className="font-headline text-sm font-bold text-on-surface">
                                {getItemTitle(
                                    selectedItem,
                                    selected?.type ?? "",
                                )}
                            </p>
                        </div>
                        <p className="text-base font-bold text-primary">
                            {idr.format(selectedItem.product_price)}
                        </p>
                    </div>
                    <button
                        onClick={() => onBuy(selectedItem)}
                        className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-on-primary transition hover:bg-primary-dim active:scale-[0.98]"
                    >
                        Lanjutkan ke Pembayaran →
                    </button>
                </div>
            )}

            {/* Raw JSON dialog */}
            {inspecting && (
                <RawJsonDialog
                    item={inspecting}
                    onClose={() => setInspecting(null)}
                />
            )}
        </>
    );
}
