import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Check, XCircle, Clock, ArrowLeft, RefreshCw,
    BarChart2, Receipt, ChevronRight, HardHat, Shield,
} from 'lucide-react';
import { idr } from '@/lib/PPOB';


interface Props {
    orderId: string;
    transactionStatus: string;
    statusCode: string;
    transaction: {
        product_code: string;
        customer_id: string;
        customer_name: string | null;
        segment_power: string | null;
        price: number;
        type: string;
    } | null;
}

type State = 'success' | 'pending' | 'failed';

function resolveState(status: string, code: string): State {
    if (status === 'settlement' || status === 'capture') return 'success';
    if (status === 'pending' || code === '201') return 'pending';
    return 'failed';
}

const customerLabel: Record<string, string> = {
    pln:            'Nomor Meter',
    pln_pasca:      'Nomor Meter',
    tv_pasca:       'Nomor Pelanggan',
    internet_pasca: 'Nomor Pelanggan',
    pulsa:          'Nomor Tujuan',
    data:           'Nomor Tujuan',
    etoll:          'Nomor Tujuan',
    tv:             'Nomor Pelanggan',
};

export default function Finish({ orderId, transactionStatus, statusCode, transaction }: Props) {
    const state = resolveState(transactionStatus, statusCode);
    const [wipToast, setWipToast] = useState(false);

    useEffect(() => {
        if (!wipToast) return;
        const t = setTimeout(() => setWipToast(false), 2500);
        return () => clearTimeout(t);
    }, [wipToast]);

    const cfg = {
        success: {
            heroBg:      'bg-linear-to-b from-primary-container/40 to-surface-bright',
            outerRing:   'bg-primary/20',
            innerCircle: 'bg-primary',
            icon:        <Check className="size-10 text-white" strokeWidth={3} />,
            title:       'Payment Successful!',
            desc:        'Your digital transaction has been processed.',
            badge: (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                    COMPLETED
                </span>
            ),
        },
        pending: {
            heroBg:      'bg-linear-to-b from-amber-50 to-surface-bright',
            outerRing:   'bg-amber-200/50',
            innerCircle: 'bg-amber-400',
            icon:        <RefreshCw className="size-10 text-white animate-spin" />,
            title:       'Processing Payment…',
            desc:        'Please wait while we verify your transaction.',
            badge: (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-600">
                    <Clock className="size-3" />
                    PENDING
                </span>
            ),
        },
        failed: {
            heroBg:      'bg-linear-to-b from-red-50 to-surface-bright',
            outerRing:   'bg-red-200/50',
            innerCircle: 'bg-red-500',
            icon:        <XCircle className="size-10 text-white" strokeWidth={2} />,
            title:       'Payment Failed',
            desc:        'Your transaction was cancelled or could not be processed.',
            badge: (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-500">
                    FAILED
                </span>
            ),
        },
    }[state];

    const ctaButtons = (
        <>
            <Link
                href="/"
                className="w-full rounded-2xl bg-primary py-4 text-center text-sm font-bold text-on-primary shadow-sm transition hover:bg-primary-dim active:scale-[0.99]"
            >
                Back to Home
            </Link>
            <button
                onClick={() => setWipToast(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface-container-low py-4 text-sm font-bold text-on-surface-variant transition hover:bg-surface-container"
            >
                <Receipt className="size-4" />
                View Receipt
            </button>
        </>
    );

    return (
        <>
            <Head title={cfg.title} />

            {/* Top bar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center border-b border-outline-variant/10 bg-surface-bright/90 px-4 py-3.5 backdrop-blur-md">
                <Link
                    href="/"
                    className="absolute left-4 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant transition hover:bg-surface-container-high"
                >
                    <ArrowLeft className="size-5" />
                </Link>
                <p className="font-headline text-sm font-bold text-on-surface">
                    Transaction
                </p>
            </div>

            {/* ── Main: 2-col desktop / stacked mobile ── */}
            <div className="flex min-h-[calc(100svh-56px)] flex-col pt-14 lg:flex-row">
                {/* LEFT col — hero status */}
                <div
                    className={`flex flex-col items-center justify-center px-10 py-14 text-center lg:sticky lg:top-14 lg:w-2/5 lg:self-start lg:min-h-[calc(100svh-56px)] ${cfg.heroBg}`}
                >
                    {/* Icon rings */}
                    <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center">
                        <div
                            className={`absolute inset-0 rounded-full ${cfg.outerRing}`}
                        />
                        <div
                            className={`relative flex h-24 w-24 items-center justify-center rounded-full ${cfg.innerCircle} shadow-xl`}
                        >
                            {cfg.icon}
                        </div>
                    </div>

                    <h1 className="font-headline text-3xl font-extrabold text-on-surface lg:text-4xl">
                        {cfg.title}
                    </h1>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-on-surface-variant">
                        {cfg.desc}
                    </p>

                    {/* Buttons — desktop only */}
                    <div className="mt-8 hidden w-full max-w-xs flex-col gap-3 lg:flex">
                        {ctaButtons}
                    </div>
                </div>

                {/* RIGHT col — transaction details */}
                <div className="flex flex-1 flex-col gap-4 px-4 py-8 sm:px-8 lg:w-3/5 lg:px-12 lg:py-14">
                    <div className="mx-auto w-full max-w-xl flex flex-col gap-4">
                        {/* Unified detail card */}
                        <div className="overflow-hidden rounded-3xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm">
                            {/* Total payment */}
                            <div className="border-b border-outline-variant/10 px-6 py-5">
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                    Total Payment
                                </p>
                                <p className="font-headline text-4xl font-black text-on-surface">
                                    {transaction
                                        ? idr.format(transaction.price)
                                        : "—"}
                                </p>
                            </div>

                            {/* Product */}
                            {transaction && (
                                <div className="flex items-center justify-between gap-4 border-b border-outline-variant/10 px-6 py-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                            Product
                                        </p>
                                        <p className="text-sm font-bold text-on-surface">
                                            {transaction.product_code}
                                        </p>
                                        {transaction.customer_name && (
                                            <p className="mt-0.5 text-xs text-on-surface-variant">
                                                {transaction.customer_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container">
                                        <BarChart2 className="size-5 text-primary" />
                                    </div>
                                </div>
                            )}

                            {/* Payment method + Status */}
                            <div className="grid grid-cols-2 gap-4 border-b border-outline-variant/10 px-6 py-4">
                                <div>
                                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        Payment Method
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                                            <Shield className="size-3.5 text-on-surface-variant" />
                                        </div>
                                        <p className="text-sm font-semibold text-on-surface">
                                            Virtual Account
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        Status
                                    </p>
                                    {cfg.badge}
                                </div>
                            </div>

                            {/* Order ID + Customer */}
                            <div className="grid grid-cols-2 gap-4 px-6 py-4">
                                <div>
                                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        Order ID
                                    </p>
                                    <p className="truncate font-mono text-xs font-semibold text-on-surface">
                                        {orderId}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        {customerLabel[
                                            transaction?.type ?? ""
                                        ] ?? "Nomor Tujuan"}
                                    </p>
                                    <p className="truncate text-sm font-semibold text-on-surface">
                                        {transaction?.customer_id ?? "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Segment power — PLN only */}
                            {transaction?.segment_power && (
                                <div className="border-t border-outline-variant/10 px-6 py-4">
                                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        Tarif / Daya
                                    </p>
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                        {transaction.segment_power}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Digital Receipt row */}
                        <button
                            onClick={() => setWipToast(true)}
                            className="flex w-full items-center gap-4 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-5 py-4 shadow-sm transition hover:bg-surface-container-low"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container">
                                <Receipt className="size-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                                <p className="text-sm font-bold text-on-surface">
                                    Digital Receipt Available
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                    Validated by eKhidmah Payment
                                </p>
                            </div>
                            <ChevronRight className="size-4 shrink-0 text-on-surface-variant" />
                        </button>

                        {/* Buttons — mobile only */}
                        <div className="flex flex-col gap-3 pb-8 lg:hidden">
                            {ctaButtons}
                        </div>
                    </div>
                </div>
            </div>

            {/* WIP toast */}
            <div
                className={`fixed bottom-28 left-1/2 z-60 -translate-x-1/2 transition-all duration-300 ${
                    wipToast
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0 pointer-events-none"
                }`}
            >
                <div className="flex items-center gap-2.5 rounded-2xl border border-outline-variant/20 bg-on-surface px-4 py-3 shadow-xl">
                    <HardHat className="size-4 shrink-0 text-amber-400" />
                    <p className="text-xs font-semibold text-surface-bright">
                        Fitur ini sedang dalam pengembangan
                    </p>
                </div>
            </div>
        </>
    );
}
