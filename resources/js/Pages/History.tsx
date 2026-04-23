import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, XCircle, Clock, Receipt, Zap, Wifi, Tv2, Smartphone, Wallet, Search, SlidersHorizontal, Calendar } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import BottomNav from '@/components/ui/BottomNav';
import type { PageProps } from '@/types';

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

type Transaction = {
    id: number;
    ref_id: string;
    product_code: string;
    customer_id: string;
    customer_name: string | null;
    type: string;
    price: number;
    status: number;
    payment_status: string;
    sn: string | null;
    created_at: string;
};

type Paginator = {
    data: Transaction[];
    current_page: number;
    last_page: number;
    total: number;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = PageProps<{ transactions: Paginator }>;

const typeIcon: Record<string, { icon: React.ReactNode; bg: string }> = {
    pln:            { icon: <Zap className="size-5 text-amber-600" />,      bg: 'bg-amber-100' },
    pln_pasca:      { icon: <Zap className="size-5 text-amber-600" />,      bg: 'bg-amber-100' },
    pulsa:          { icon: <Smartphone className="size-5 text-primary" />, bg: 'bg-primary-container' },
    data:           { icon: <Wifi className="size-5 text-primary" />,       bg: 'bg-primary-container' },
    tv:             { icon: <Tv2 className="size-5 text-secondary" />,      bg: 'bg-secondary-container' },
    tv_pasca:       { icon: <Tv2 className="size-5 text-secondary" />,      bg: 'bg-secondary-container' },
    internet_pasca: { icon: <Wifi className="size-5 text-secondary" />,     bg: 'bg-secondary-container' },
    etoll:          { icon: <Wallet className="size-5 text-orange-600" />,  bg: 'bg-orange-100' },
};

const typeLabel: Record<string, string> = {
    pln:            'Token Listrik',
    pln_pasca:      'PLN Pascabayar',
    pulsa:          'Pulsa',
    data:           'Paket Data',
    tv:             'TV / Internet',
    tv_pasca:       'TV Kabel',
    internet_pasca: 'Internet Rumah',
    etoll:          'E-Toll',
};

function StatusBadge({ status, paymentStatus }: { status: number; paymentStatus: string }) {
    const isSuccess = paymentStatus === 'settlement' || paymentStatus === 'capture' || status === 1;
    const isFailed  = ['cancel', 'deny', 'expire', 'failure'].includes(paymentStatus) || status === 2;

    if (isSuccess) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
            <CheckCircle2 className="size-3" /> Berhasil
        </span>
    );
    if (isFailed) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-500">
            <XCircle className="size-3" /> Gagal
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">
            <Clock className="size-3" /> Menunggu
        </span>
    );
}

function groupByDate(transactions: Transaction[]) {
    const groups: Record<string, Transaction[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    transactions.forEach((tx) => {
        const parts = tx.created_at.split(',')[0].trim();
        const date = new Date(parts.split(' ').reverse().join(' '));
        const key = date.toDateString() === today
            ? 'Hari Ini'
            : date.toDateString() === yesterday
                ? 'Kemarin'
                : parts;
        if (!groups[key]) groups[key] = [];
        groups[key].push(tx);
    });

    return groups;
}

export default function History({ transactions }: Props) {
    const { data, last_page, next_page_url, total } = transactions;
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('30days');

    const filtered = search
        ? data.filter(tx =>
            typeLabel[tx.type]?.toLowerCase().includes(search.toLowerCase()) ||
            tx.customer_id.includes(search) ||
            tx.product_code.toLowerCase().includes(search.toLowerCase()) ||
            (tx.customer_name?.toLowerCase().includes(search.toLowerCase()))
        )
        : data;

    const groups = groupByDate(filtered);

    return (
        <>
            <Head title="Riwayat Transaksi" />
            <Navbar balance={0} />

            <div className="min-h-screen bg-surface-container-low pt-[68px] pb-28">
                <div className="mx-auto max-w-2xl px-4 py-8 lg:max-w-4xl">

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-headline text-3xl font-extrabold text-on-surface">History</h1>
                        <p className="mt-0.5 text-sm text-on-surface-variant">{total} transaksi ditemukan</p>
                    </div>

                    {/* Search */}
                    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 shadow-sm">
                        <Search className="size-4 flex-shrink-0 text-on-surface-variant" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari transaksi..."
                            className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                        />
                    </div>

                    {/* Filter chips */}
                    <div className="mb-6 flex items-center gap-2">
                        <button
                            onClick={() => setActiveFilter('30days')}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${activeFilter === '30days' ? 'bg-primary text-on-primary shadow-md shadow-primary/20' : 'border border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant'}`}
                        >
                            <Calendar className="size-3.5" /> Last 30 Days
                        </button>
                        <button
                            onClick={() => setActiveFilter('category')}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${activeFilter === 'category' ? 'bg-primary text-on-primary' : 'border border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant'}`}
                        >
                            Category
                        </button>
                        <button className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant transition hover:bg-surface-container-low">
                            <SlidersHorizontal className="size-4" />
                        </button>
                    </div>

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-outline-variant/30 bg-surface-container-lowest py-20 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container">
                                <Receipt className="size-8 text-on-surface-variant" />
                            </div>
                            <p className="font-semibold text-on-surface">Belum ada transaksi</p>
                            <p className="mt-1 text-sm text-on-surface-variant">Transaksi kamu akan muncul di sini.</p>
                            <Link href="/" className="mt-5 rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition hover:bg-primary-dim">
                                Mulai Transaksi
                            </Link>
                        </div>
                    )}

                    {/* Grouped transactions */}
                    {Object.entries(groups).map(([dateLabel, txs]) => (
                        <div key={dateLabel} className="mb-6">
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                {dateLabel}
                            </p>
                            <div className="space-y-2.5">
                                {txs.map((tx) => {
                                    const iconData = typeIcon[tx.type];
                                    return (
                                        <div
                                            key={tx.id}
                                            className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm transition hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-4 px-4 py-3.5">
                                                {/* Icon */}
                                                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${iconData?.bg ?? 'bg-surface-container-low'}`}>
                                                    {iconData?.icon ?? <Receipt className="size-5 text-on-surface-variant" />}
                                                </div>

                                                {/* Info */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-on-surface">
                                                        {typeLabel[tx.type] ?? tx.type}
                                                        {tx.customer_name ? ` — ${tx.customer_name}` : ''}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-on-surface-variant">{tx.created_at}</p>
                                                </div>

                                                {/* Price + status */}
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <p className="text-sm font-bold text-on-surface">{idr.format(tx.price)}</p>
                                                    <StatusBadge status={tx.status} paymentStatus={tx.payment_status} />
                                                </div>
                                            </div>

                                            {tx.sn && (
                                                <div className="border-t border-outline-variant/10 bg-surface-container-low px-4 py-2">
                                                    <p className="text-[10px] text-on-surface-variant">
                                                        SN: <span className="font-mono font-semibold text-on-surface">{tx.sn}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Load more */}
                    {next_page_url && (
                        <Link
                            href={next_page_url}
                            className="mt-2 flex w-full items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-lowest py-3.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low"
                        >
                            Load older transactions
                        </Link>
                    )}
                </div>
            </div>

            <BottomNav active="riwayat" />
        </>
    );
}
