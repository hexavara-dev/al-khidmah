import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, XCircle, Shield, RefreshCw, ArrowLeft } from 'lucide-react';
import { idr } from '@/lib/ppob';
import Navbar from '@/components/ui/Navbar';
import BottomNav from '@/components/ui/BottomNav';

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
    pln:       'Nomor Meter',
    pln_pasca: 'Nomor Meter',
    tv_pasca:  'Nomor Pelanggan',
    internet_pasca: 'Nomor Pelanggan',
};

export default function Finish({ orderId, transactionStatus, statusCode, transaction }: Props) {
    const state = resolveState(transactionStatus, statusCode);

    return (
        <>
            <Head title={
                state === 'success' ? 'Pembayaran Berhasil' :
                state === 'pending' ? 'Memproses Pembayaran' : 'Pembayaran Gagal'
            } />

            <Navbar balance={0} appName="Al-Khidmah" />

            <div className="min-h-screen bg-surface-bright pt-[68px] pb-48">
                <div className="mx-auto max-w-lg px-6 py-10">

                    {/* Back link */}
                    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                        <ArrowLeft className="size-4" />
                        Kembali ke Beranda
                    </Link>

                    {/* Main card */}
                    <div className="overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">

                        {/* Icon + heading */}
                        <div className="flex flex-col items-center px-8 pt-10 pb-6 text-center">
                            {state === 'pending' && (
                                <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                                    <div className="absolute inset-0 rounded-full border-4 border-surface-container-high" />
                                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
                                    <RefreshCw className="size-8 text-primary" />
                                </div>
                            )}
                            {state === 'success' && (
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container/40">
                                    <CheckCircle2 className="size-12 text-secondary" />
                                </div>
                            )}
                            {state === 'failed' && (
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error-container/40">
                                    <XCircle className="size-12 text-error" />
                                </div>
                            )}

                            <h1 className="font-headline text-2xl font-extrabold text-on-surface">
                                {state === 'success' && 'Pembayaran Berhasil'}
                                {state === 'pending' && 'Sedang Memproses Pembayaran'}
                                {state === 'failed' && 'Pembayaran Gagal'}
                            </h1>
                            <p className="mt-2 max-w-xs text-sm leading-6 text-on-surface-variant">
                                {state === 'success' && 'Transaksi kamu sudah dikonfirmasi dan sedang diproses oleh sistem.'}
                                {state === 'pending' && 'Mohon tunggu sebentar, kami sedang memverifikasi transaksi Anda.'}
                                {state === 'failed' && 'Transaksi dibatalkan atau gagal diproses. Silakan coba lagi.'}
                            </p>
                        </div>

                        {/* Payment details */}
                        {transaction && (
                            <div className="mx-6 mb-5 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        Total Payment
                                    </span>
                                    <span className="rounded-full border border-outline-variant/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                        Secure
                                    </span>
                                </div>
                                <p className="mb-4 font-headline text-3xl font-black text-primary">
                                    {idr.format(transaction.price)}
                                </p>
                                <div className="space-y-2.5 border-t border-outline-variant/10 pt-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-on-surface-variant">Merchant</span>
                                        <span className="font-bold text-on-surface">Al-Khidmah</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-on-surface-variant">Transaction ID</span>
                                        <span className="font-mono text-xs font-semibold text-on-surface">{orderId}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-on-surface-variant">
                                            {customerLabel[transaction.type] ?? 'Nomor Tujuan'}
                                        </span>
                                        <span className="font-semibold text-on-surface">{transaction.customer_id}</span>
                                    </div>
                                    {transaction.customer_name && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-on-surface-variant">Atas Nama</span>
                                            <span className="font-semibold text-on-surface">{transaction.customer_name}</span>
                                        </div>
                                    )}
                                    {transaction.segment_power && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-on-surface-variant">Tarif / Daya</span>
                                            <span className="font-medium text-on-surface">{transaction.segment_power}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-on-surface-variant">Produk</span>
                                        <span className="font-medium text-on-surface">{transaction.product_code}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pending: verifying status */}
                        {state === 'pending' && (
                            <div className="mx-6 mb-5 flex items-center gap-2">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                                    Verifying with Bank Gateway
                                </span>
                            </div>
                        )}

                        {/* SSL banner */}
                        <div className="mx-6 mb-6 flex items-center justify-center gap-2 rounded-2xl bg-secondary-container/20 py-3">
                            <Shield className="size-4 text-secondary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-on-secondary-container">
                                SSL Encrypted Payment Environment
                            </span>
                        </div>

                        {/* CTA */}
                        <div className="border-t border-outline-variant/10 p-6 flex gap-3">
                            <Link
                                href="/"
                                className="flex-1 rounded-2xl bg-primary py-3.5 text-center text-sm font-bold text-on-primary transition hover:bg-primary-dim active:scale-[0.98]"
                            >
                                Kembali ke Beranda
                            </Link>
                            {state === 'failed' && (
                                <Link
                                    href="/"
                                    className="flex-1 rounded-2xl border border-outline-variant/30 py-3.5 text-center text-sm font-bold text-on-surface-variant transition hover:bg-surface-container-low"
                                >
                                    Coba Lagi
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav active="tagihan" />
        </>
    );
}
