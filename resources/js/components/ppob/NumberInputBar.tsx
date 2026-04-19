import { CheckCircle2, XCircle, Smartphone, Zap, Tv2, Wallet, Wifi } from 'lucide-react';
import type { Operator } from '@/types/ppob';

const emoneyOptions = [
    { label: 'OVO',       value: 'ovo'      },
    { label: 'GoPay',     value: 'gopay'    },
    { label: 'DANA',      value: 'dana'     },
    { label: 'ShopeePay', value: 'shopee'   },
    { label: 'LinkAja',   value: 'linkaja'  },
];

const inputLabels: Record<string, string> = {
    pulsa:     'Nomor Telepon',
    data:      'Nomor Telepon',
    pln:       'Nomor Meter / ID Pelanggan',
    pln_pasca: 'Nomor Meter / ID Pelanggan',
    tv:        'ID Pelanggan',
    etoll:     'Nomor HP / ID Akun',
};

const inputIcons: Record<string, typeof Smartphone> = {
    pulsa:     Smartphone,
    data:      Wifi,
    pln:       Zap,
    pln_pasca: Zap,
    tv:        Tv2,
    etoll:     Wallet,
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
};

export default function NumberInputBar({ value, placeholder, isValid, onChange, onCheck, operator, buttonLabel, type, emoneyProvider, onEmoneyChange }: Props) {
    const isEmoney = type === 'etoll';
    const label = inputLabels[type ?? ''] ?? 'Nomor / ID Pelanggan';
    const Icon = inputIcons[type ?? ''] ?? Smartphone;

    return (
        <div className="space-y-4">
            <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
                <div className={`flex items-center gap-3 rounded-2xl border bg-surface-container-low px-4 py-3.5 transition-colors focus-within:border-primary focus-within:bg-surface-container-lowest ${
                    isValid === false ? 'border-error/50' : 'border-outline-variant/30'
                }`}>
                    <Icon className="size-5 flex-shrink-0 text-primary" />
                    <input
                        type="number"
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className="min-w-0 flex-1 border-none bg-transparent text-base text-on-surface outline-none placeholder:text-on-surface-variant [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    {isValid !== null && (
                        isValid
                            ? <CheckCircle2 className="size-5 flex-shrink-0 text-secondary" />
                            : <XCircle className="size-5 flex-shrink-0 text-error" />
                    )}
                </div>

                {/* Operator badge below input */}
                {!isEmoney && operator && (
                    <div className="mt-2 flex items-center gap-2 px-1">
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                        <img src={operator.image} alt={operator.name} className="h-4 w-auto object-contain" />
                        <span className="text-xs font-semibold capitalize text-on-surface-variant">
                            {operator.name} <span className="text-secondary">• Aktif</span>
                        </span>
                    </div>
                )}
            </div>

            {/* E-money selector */}
            {isEmoney && (
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Pilih E-Money</p>
                    <div className="flex flex-wrap gap-2">
                        {emoneyOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onEmoneyChange?.(opt.value)}
                                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                                    emoneyProvider === opt.value
                                        ? 'border-primary bg-primary-container text-primary'
                                        : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-primary/40'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA Button */}
            <button
                onClick={onCheck}
                className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-on-primary transition hover:bg-primary-dim active:scale-[0.98]"
            >
                {buttonLabel ?? 'Cek Layanan'} →
            </button>
        </div>
    );
}
