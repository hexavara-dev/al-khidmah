import { Zap, Tv2, CheckCircle2 } from "lucide-react";
import type { PostpaidBill } from "@/types/PPOB";
import { idr } from "@/lib/PPOB";

type Props = {
    bill: PostpaidBill;
    customerNumber: string;
    serviceType?: string;
    serviceLabel?: string;
    onPay: (bill: PostpaidBill) => void;
};

function formatPeriod(period: string): string {
    if (!period || period.length !== 6) return period;
    const bulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    const year = period.slice(0, 4);
    const month = parseInt(period.slice(4, 6), 10);
    return `${bulan[month - 1] ?? period} ${year}`;
}

export default function BillInquiryCard({
    bill,
    customerNumber,
    serviceType = "pln_pasca",
    serviceLabel,
    onPay,
}: Props) {
    const isTv =
        serviceType === "tv" ||
        serviceType === "tv_pasca" ||
        serviceType === "internet_pasca";
    const Icon = isTv ? Tv2 : Zap;
    const customerLabel = isTv ? "ID Pelanggan" : "Nomor Meter";
    const isLunas = bill.already_paid === true;

    return (
        <div className="mb-5 space-y-3">
            {/* ── Hero card — selalu tosca ── */}
            <div className="relative overflow-hidden rounded-2xl bg-primary px-5 py-5 shadow-lg shadow-primary/20">
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />

                {/* Top row: label + status badge */}
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                            <Icon className="size-4 text-on-primary" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-primary/70">
                            Informasi Tagihan
                        </p>
                    </div>
                    {isLunas ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                            <CheckCircle2 className="size-3" /> Sudah Lunas
                        </span>
                    ) : (
                        <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-primary">
                            Belum Bayar
                        </span>
                    )}
                </div>

                {/* Customer name */}
                <p className="mb-4 text-xl font-bold text-on-primary">
                    {bill.customer_name ?? customerNumber}
                </p>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/10 px-4 py-3">
                        <p className="mb-1 text-[14px] text-on-primary/60">
                            {customerLabel}
                        </p>
                        <p className="text-md font-bold text-on-primary">
                            {customerNumber}
                        </p>
                    </div>
                    {bill.period && (
                        <div className="rounded-xl bg-white/10 px-4 py-3">
                            <p className="mb-1 text-[14px] text-on-primary/60">
                                Periode
                            </p>
                            <p className="text-md font-bold text-on-primary">
                                {formatPeriod(bill.period)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="mt-4 border-t border-white/15 pt-4">
                    <p className="mb-0.5 text-[10px] text-on-primary/60">
                        Total Tagihan
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-on-primary">
                        {bill.price > 0 ? idr.format(bill.price) : "—"}
                    </p>
                </div>
            </div>

            {/* ── Banner lunas ── */}
            {isLunas && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5">
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                    <div>
                        <p className="text-sm font-bold text-emerald-700">
                            Tagihan Sudah Lunas
                        </p>
                        <p className="text-xs text-emerald-600">
                            Tidak ada tagihan yang perlu dibayarkan saat ini.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Rincian — selalu tampil jika ada data ── */}
            {bill.nominal > 0 && (
                <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest">
                    <div className="divide-y divide-outline-variant/10 text-sm">
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-on-surface-variant">
                                Tagihan
                            </span>
                            <span className="font-medium text-on-surface">
                                {idr.format(bill.nominal)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-on-surface-variant">
                                Biaya Admin
                            </span>
                            <span className="font-medium text-on-surface">
                                {idr.format(bill.admin)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="font-semibold text-on-surface">
                                Total Bayar
                            </span>
                            <span className="font-bold text-primary">
                                {idr.format(bill.price)}
                            </span>
                        </div>
                    </div>

                    {/* Tombol bayar — hanya tampil jika belum lunas, desktop only */}
                    {!isLunas && (
                        <div className="hidden px-4 py-4 sm:hidden">
                            <button
                                onClick={() => onPay(bill)}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-on-primary transition hover:bg-primary-dim active:scale-[0.98]"
                            >
                                Lanjutkan ke Pembayaran
                                <svg
                                    className="size-4"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <path
                                        d="M6 12l4-4-4-4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
