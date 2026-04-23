import {
    CheckCircle2,
    XCircle,
    Smartphone,
    Zap,
    Tv2,
    Wallet,
    Wifi,
} from "lucide-react";
import type { Operator, PricelistItem } from "@/types/PPOB";

const ALLOWED_EWALLET = ["ovo", "gopay", 'dana',"shopeepay", "linkaja"];

function getEmoneyProviders(items: PricelistItem[]) {
    const seen = new Set<string>();
    const providers: { label: string; value: string; icon: string }[] = [];
    for (const item of items) {
        const matched = ALLOWED_EWALLET.find((w) =>
            item.product_description.toLowerCase().includes(w) ||
            item.product_code.toLowerCase().includes(w)
        );
        if (!matched || seen.has(matched)) continue;
        seen.add(matched);
        providers.push({
            label: item.product_description,
            value: matched,
            icon: item.icon_url ?? '',
        });
    }
    return providers;
}
const inputLabels: Record<string, string> = {
    pulsa: "Nomor Telepon",
    data: "Nomor Telepon",
    pln: "Nomor Meter / ID Pelanggan",
    pln_pasca: "Nomor Meter / ID Pelanggan",
    tv: "ID Pelanggan",
    etoll: "Nomor HP / ID Akun",
};

const inputIcons: Record<string, typeof Smartphone> = {
    pulsa: Smartphone,
    data: Wifi,
    pln: Zap,
    pln_pasca: Zap,
    tv: Tv2,
    etoll: Wallet,
};

type Props = {
    value: string;
    placeholder: string;
    isValid: boolean | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheck: () => void;
    operator?: Operator | null;
    buttonLabel?: string;
    type?: string;
    emoneyProvider?: string;
    onEmoneyChange?: (value: string) => void;
    emoneyItems?: PricelistItem[]; // ← tambah prop ini
};

export default function NumberInputBar({
    value,
    placeholder,
    isValid,
    onChange,
    onCheck,
    operator,
    buttonLabel,
    type,
    emoneyProvider,
    onEmoneyChange,
    emoneyItems = [],
}: Props) {
    const isEmoney = type === "etoll";
    const label = inputLabels[type ?? ""] ?? "Nomor / ID Pelanggan";
    const Icon = inputIcons[type ?? ""] ?? Smartphone;
    const emoneyProviders = isEmoney ? getEmoneyProviders(emoneyItems) : [];

    return (
        <div className="space-y-4">
            {/* E-money selector — di atas input */}
            {isEmoney && emoneyProviders.length > 0 && (
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Pilih E-Wallet
                    </p>
                    <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
                        {emoneyProviders.map((opt) => {
                            const isActive = emoneyProvider === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => onEmoneyChange?.(opt.value)}
                                    className="flex shrink-0 flex-col items-center gap-1.5"
                                >
                                    <div
                                        className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-surface-container transition-all ${
                                            isActive
                                                ? "ring-2 ring-primary ring-offset-2 scale-105 shadow-md"
                                                : "opacity-60 hover:opacity-100"
                                        }`}
                                    >
                                        <img
                                            src={opt.icon}
                                            alt={opt.label}
                                            className="h-10 w-10 object-contain"
                                        />
                                    </div>
                                    <span
                                        className={`text-[11px] font-semibold transition-colors ${
                                            isActive
                                                ? "text-primary"
                                                : "text-on-surface-variant"
                                        }`}
                                    >
                                        {opt.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Input field */}
            <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {label}
                </p>
                <div
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
                        isValid === true
                            ? "border-emerald-400 bg-emerald-50 focus-within:border-emerald-500"
                            : isValid === false
                              ? "border-error/50 bg-surface-container-low focus-within:border-error"
                              : "border-outline-variant/30 bg-surface-container-low focus-within:border-primary focus-within:bg-surface-container-lowest"
                    }`}
                >
                    <Icon
                        className={`size-5 shrink-0 transition-colors duration-200 ${isValid === true ? "text-emerald-500" : "text-primary"}`}
                    />
                    <input
                        type="number"
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className="min-w-0 flex-1 border-none bg-transparent text-base text-on-surface outline-none placeholder:text-on-surface-variant [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    {isValid !== null &&
                        (isValid ? (
                            <CheckCircle2 className="size-5 shrink-0 text-emerald-500 drop-shadow-sm" />
                        ) : (
                            <XCircle className="size-5 shrink-0 text-error" />
                        ))}
                </div>
                {!isEmoney && operator && (
                    <div className="mt-2 flex items-center gap-2 px-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <img
                            src={operator.image}
                            alt={operator.name}
                            className="h-4 w-auto object-contain"
                        />
                        <span className="text-xs font-semibold capitalize text-on-surface-variant">
                            {operator.name}{" "}
                            <span className="text-emerald-500">• Aktif</span>
                        </span>
                    </div>
                )}
            </div>

            {/* CTA */}
            <button
                onClick={onCheck}
                className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-on-primary transition hover:bg-primary-dim active:scale-[0.98]"
            >
                {buttonLabel ?? "Cek Layanan"} →
            </button>
        </div>
    );
}
