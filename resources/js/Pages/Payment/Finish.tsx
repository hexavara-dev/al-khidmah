import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { idr } from '@/lib/ppob';

interface Props {
    orderId: string;
    transactionStatus: string;
    statusCode: string;
    transaction: {
        product_code: string;
        customer_id: string;
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

const config: Record<State, {
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: string;
    bg: string;
}> = {
    success: {
        icon: <CheckCircle2 className="size-16 text-green-500" />,
        title: 'Pembayaran Berhasil',
        desc: 'Transaksi kamu sudah diterima dan sedang diproses.',
        color: 'text-green-700',
        bg: 'bg-green-50',
    },
    pending: {
        icon: <Clock className="size-16 text-yellow-500" />,
        title: 'Menunggu Pembayaran',
        desc: 'Pembayaran belum selesai. Kamu bisa melanjutkan kapan saja sebelum kedaluwarsa.',
        color: 'text-yellow-700',
        bg: 'bg-yellow-50',
    },
    failed: {
        icon: <XCircle className="size-16 text-red-500" />,
        title: 'Pembayaran Gagal',
        desc: 'Transaksi dibatalkan atau gagal diproses. Silakan coba lagi.',
        color: 'text-red-700',
        bg: 'bg-red-50',
    },
};

export default function Finish({ orderId, transactionStatus, statusCode, transaction }: Props) {
    const state = resolveState(transactionStatus, statusCode);
    const { icon, title, desc, color, bg } = config[state];

    return (
        <>
            <Head title={title} />
            <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                    <div className="flex flex-col items-center gap-4 text-center">
                        {icon}
                        <h1 className={`text-xl font-semibold ${color}`}>{title}</h1>
                        <p className="text-sm leading-6 text-gray-500">{desc}</p>
                    </div>

                    {transaction && (
                        <div className={`mt-6 divide-y divide-gray-100 rounded-xl border border-gray-100 ${bg} text-sm`}>
                            <div className="flex justify-between px-4 py-3">
                                <span className="text-gray-500">Order ID</span>
                                <span className="font-mono text-xs font-medium text-gray-700">{orderId}</span>
                            </div>
                            <div className="flex justify-between px-4 py-3">
                                <span className="text-gray-500">Nomor Tujuan</span>
                                <span className="font-semibold text-gray-900">{transaction.customer_id}</span>
                            </div>
                            <div className="flex justify-between px-4 py-3">
                                <span className="text-gray-500">Produk</span>
                                <span className="font-medium text-gray-800">{transaction.product_code}</span>
                            </div>
                            <div className="flex justify-between px-4 py-3">
                                <span className="text-gray-500">Total</span>
                                <span className="font-bold text-green-600">{idr.format(transaction.price)}</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex gap-3">
                        <Link
                            href="/"
                            className="flex-1 rounded-xl bg-green-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
