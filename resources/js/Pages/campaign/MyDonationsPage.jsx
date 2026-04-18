import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { donationService } from '../../services/donationService';
import toast from 'react-hot-toast';

const fmt = (n) => Number(n).toLocaleString('id-ID');

const formatPaymentMethod = (method) => {
    if (!method || method === '-') return '-';
    const map = {
        bca_va:       'Transfer BCA',
        bni_va:       'Transfer BNI',
        bri_va:       'Transfer BRI',
        mandiri_va:   'Transfer Mandiri',
        permata_va:   'Transfer Permata',
        mandiri_bill: 'Mandiri Bill',
        credit_card:  'Kartu Kredit',
        gopay:        'GoPay',
        shopeepay:    'ShopeePay',
        qris:         'QRIS',
        indomaret:    'Indomaret',
        alfamart:     'Alfamart',
        bank_transfer:'Transfer Bank',
        midtrans:     'Midtrans',
        echannel:     'Mandiri Bill',
        cstore:       'Minimarket',
    };
    return map[method.toLowerCase()] ?? method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const STATUS_CONFIG = {
    success: { label: 'Berhasil',  bg: 'bg-green-100', text: 'text-green-700',  icon: '✅' },
    pending: { label: 'Menunggu',  bg: 'bg-amber-100', text: 'text-amber-700',  icon: '⏳' },
    failed:  { label: 'Gagal',     bg: 'bg-red-100',   text: 'text-red-700',    icon: '❌' },
};

function DonationDetailModal({ donation, onClose, onStatusUpdated }) {
    if (!donation) return null;

    const isAnon = donation.note?.startsWith('[Anonim]');
    const cleanNote = isAnon
        ? donation.note.replace('[Anonim]', '').trim()
        : donation.note;
    const statusCfg = STATUS_CONFIG[donation.status] ?? STATUS_CONFIG.pending;

    const [checking, setChecking] = useState(false);

    const handleCheckStatus = async () => {
        setChecking(true);
        try {
            const { data } = await donationService.checkPayment(donation.id);
            if (data.success) {
                onStatusUpdated(data.data);
                if (data.data.status === 'success') {
                    toast.success('Alhamdulillah! Pembayaran berhasil dikonfirmasi.');
                } else if (data.data.status === 'failed') {
                    toast.error('Pembayaran gagal atau dibatalkan.');
                } else {
                    toast('Pembayaran masih menunggu konfirmasi.', { icon: '⏳' });
                }
            }
        } catch {
            toast.error('Gagal memeriksa status. Silakan coba lagi.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Sheet */}
            <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 pt-4 pb-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-800">Rincian Donasi</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-500 text-sm font-bold">
                        ✕
                    </button>
                </div>

                {/* Status banner */}
                <div className={`mx-6 mt-5 rounded-2xl p-4 flex items-center gap-3 ${statusCfg.bg}`}>
                    <span className="text-2xl">{statusCfg.icon}</span>
                    <div>
                        <p className={`font-bold text-sm ${statusCfg.text}`}>{statusCfg.label}</p>
                        <p className={`text-xs mt-0.5 ${statusCfg.text} opacity-75`}>
                            {donation.status === 'success'
                                ? 'Pembayaran berhasil dikonfirmasi'
                                : donation.status === 'pending'
                                ? 'Menunggu konfirmasi pembayaran'
                                : 'Pembayaran gagal atau dibatalkan'}
                        </p>
                    </div>
                </div>

                {/* Detail rows */}
                <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                    <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-400">ID Transaksi</span>
                        <span className="text-sm font-semibold text-blue-600 font-mono">
                            AK-{String(donation.id).padStart(8, '0')}
                        </span>
                    </div>

                    <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-400">Program Donasi</span>
                        <span className="text-sm font-medium text-gray-800 text-right max-w-[55%] leading-snug">
                            {donation.campaign?.title ?? 'Campaign dihapus'}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Metode Bayar</span>
                        <span className="text-sm font-medium text-gray-800">
                            {formatPaymentMethod(donation.payment_method)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Tanggal</span>
                        <span className="text-sm font-medium text-gray-800">
                            {new Date(donation.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'long', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    </div>

                    {cleanNote && (
                        <div className="flex justify-between items-start">
                            <span className="text-sm text-gray-400">Catatan</span>
                            <span className="text-sm text-gray-600 italic text-right max-w-[55%]">"{cleanNote}"</span>
                        </div>
                    )}

                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Total Donasi</span>
                        <span className="text-xl font-bold text-blue-600">Rp {fmt(donation.amount)}</span>
                    </div>
                </div>

                {/* Action */}
                <div className="px-6 pb-6 pt-2 space-y-2 flex-none border-t border-gray-100">
                    {donation.status === 'pending' && (
                        <button
                            onClick={handleCheckStatus}
                            disabled={checking}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white py-3.5 rounded-2xl font-semibold transition flex items-center justify-center gap-2"
                        >
                            {checking ? (
                                <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Memeriksa...</>
                            ) : (
                                <><span>🔄</span> Cek Status Pembayaran</>
                            )}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-blue-500 to-emerald-600 text-white py-3.5 rounded-2xl font-semibold hover:opacity-90 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MyDonationsPage() {
    const [donations, setDonations]         = useState([]);
    const [meta, setMeta]                   = useState(null);
    const [loading, setLoading]             = useState(true);
    const [page, setPage]                   = useState(1);
    const [totalAmount, setTotalAmount]     = useState(0);
    const [selectedDonation, setSelected]   = useState(null);

    const loadDonations = () => {
        setLoading(true);
        donationService.myDonations({ page })
            .then(({ data }) => {
                setDonations(data.data.data);
                setMeta(data.data);
                if (data.total_amount !== undefined) setTotalAmount(data.total_amount);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadDonations();
    }, [page]);

    const handleStatusUpdated = (updatedDonation) => {
        setDonations(prev => prev.map(d => d.id === updatedDonation.id ? { ...d, ...updatedDonation } : d));
        setSelected(updatedDonation);
        if (updatedDonation.status === 'success') {
            setTotalAmount(prev => prev + Number(updatedDonation.amount));
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-6 pt-10 pb-14">
                    <p className="text-blue-200 text-sm mb-1">Total Kontribusi Anda</p>
                    <p className="text-4xl font-bold text-white mb-6">
                        Rp {fmt(totalAmount)}
                    </p>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold shadow">
                            🕐 Riwayat
                        </button>
                        <Link
                            to="/donasi"
                            className="flex items-center gap-2 bg-white/20 text-white border border-white/30 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/30 transition"
                        >
                            🤲 Donasi Baru
                        </Link>
                    </div>
                </div>

                {/* Content card — overlaps the header */}
                <div className="-mt-6 bg-gray-50 rounded-t-3xl px-4 pt-6 pb-10 min-h-[60vh]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-gray-700">Riwayat Donasi</h2>
                        {meta?.total !== undefined && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                {meta.total} transaksi
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-3">🤲</div>
                            <p className="text-gray-600 font-medium">Belum ada riwayat donasi.</p>
                            <p className="text-gray-400 text-sm mt-1">Yuk mulai berdonasi untuk sesama!</p>
                            <Link
                                to="/donasi"
                                className="mt-4 inline-block bg-gradient-to-r from-blue-500 to-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow"
                            >
                                Lihat Program Donasi
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {donations.map((d) => {
                                    const initials = (d.campaign?.title ?? 'D').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                                    return (
                                        <button
                                            key={d.id}
                                            onClick={() => setSelected(d)}
                                            className="w-full bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-emerald-500 flex items-center justify-center flex-none">
                                                    <span className="text-white text-xs font-bold">{initials}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">
                                                        {d.campaign?.title ?? 'Campaign dihapus'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {(d.payment_method ?? '-').replace(/_/g, ' ').toUpperCase()} &bull;{' '}
                                                        {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    {d.note && !d.note.startsWith('[Anonim]') && (
                                                        <p className="text-xs text-gray-400 mt-0.5 italic line-clamp-1">"{d.note}"</p>
                                                    )}
                                                </div>
                                                <div className="text-right flex-none">
                                                    <p className="font-bold text-blue-600 text-sm">Rp {fmt(d.amount)}</p>
                                                    <div className="mt-1"><StatusBadge status={d.status} /></div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <Pagination meta={meta} onPageChange={setPage} />
                        </>
                    )}
                </div>
            </div>

            {/* Donation detail modal */}
            <DonationDetailModal
                donation={selectedDonation}
                onClose={() => setSelected(null)}
                onStatusUpdated={handleStatusUpdated}
            />
        </MainLayout>
    );
}
