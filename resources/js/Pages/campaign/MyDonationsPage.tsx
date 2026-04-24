import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { donationService } from '../../services/donationService';
import toast from 'react-hot-toast';
import { Donation, PaginatedData, PageProps } from '../../types';

interface MyDonationsPageProps extends PageProps {
    donations: PaginatedData<Donation>;
    totalAmount: number;
}

const fmt = (n: number | string) => Number(n).toLocaleString('id-ID');

const formatPaymentMethod = (method: string | null | undefined): string => {
    if (!method || method === '-') return '-';
    const map: Record<string, string> = {
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
    return map[method.toLowerCase()] ?? method.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    success: { label: 'Berhasil',  bg: 'bg-green-100', text: 'text-green-700',  icon: '✅' },
    pending: { label: 'Menunggu',  bg: 'bg-amber-100', text: 'text-amber-700',  icon: '⏳' },
    failed:  { label: 'Gagal',     bg: 'bg-red-100',   text: 'text-red-700',    icon: '❌' },
};

function DonationStruktModal({ donation, onClose }: { donation: Donation | null; onClose: () => void }) {
    if (!donation) return null;

    const fmtPay = (m: string | null | undefined): string => {
        if (!m || m === '-') return '-';
        const map: Record<string, string> = { bca_va: 'BCA VA', bni_va: 'BNI VA', mandiri_va: 'Mandiri VA', bri_va: 'BRI VA', gopay: 'GoPay', shopeepay: 'ShopeePay', qris: 'QRIS', indomaret: 'Indomaret', alfamart: 'Alfamart', credit_card: 'Kartu Kredit', bank_transfer: 'Transfer Bank', cstore: 'Minimarket', echannel: 'Mandiri Bill' };
        return map[m.toLowerCase()] ?? m.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    };
    const paidAt = donation.updated_at ? new Date(donation.updated_at) : new Date(donation.created_at);
    const dateStr = paidAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + paidAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const txId = `AK-${String(donation.id).padStart(10, '0')}`;
    const isAnon = donation.note?.startsWith('[Anonim]');
    const cleanNote = (donation.note ?? '').replace('[Anonim]', '').trim();
    const donorDisplay = isAnon ? 'Hamba Allah' : (donation.donor_name ?? 'Donatur');

    const handleSave = () => {
        toast('Membuka tampilan cetak...', { icon: '🖨️' });
        setTimeout(() => window.print(), 300);
    };
    const handleShare = async () => {
        const text = `Alhamdulillah, saya baru berdonasi Rp ${fmt(donation.amount)} untuk "${donation.campaign?.title}" melalui eKhidmah. 🤲`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Struk Donasi eKhidmah', text }); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(text);
            toast.success('Teks donasi disalin!');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-gray-50 overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h1 className="text-base font-bold text-[#00cacd]">eKhidmah</h1>
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-5 pb-36">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Card header */}
                    <div className="px-6 pt-8 pb-6 text-center border-b border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-[#00cacd]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00cacd" className="w-9 h-9">
                                {/* Small heart at top */}
                                <path d="M12 7.5C11.4 6.4 9.75 6.35 9.75 8.1C9.75 9.75 12 11.25 12 11.25C12 11.25 14.25 9.75 14.25 8.1C14.25 6.35 12.6 6.4 12 7.5Z"/>
                                {/* Open giving palm */}
                                <path d="M5.5 12.5C5.5 12.5 4.5 13.3 4.5 14.75C4.5 16 5 16.75 5 16.75H19C19 16.75 19.5 16 19.5 14.75C19.5 13.3 18.5 12.5 18.5 12.5L15.75 11.5C15.75 11.5 14.75 12 12 12C9.25 12 8.25 11.5 8.25 11.5L5.5 12.5Z"/>
                                {/* Wrist */}
                                <path d="M5 17.25H19C19 17.25 19.75 17.75 19.75 18.5C19.75 19.25 19 19.75 19 19.75H5C5 19.75 4.25 19.25 4.25 18.5C4.25 17.75 5 17.25 5 17.25Z"/>
                            </svg>
                        </div>
                        <h2 className="font-bold text-gray-800 text-lg">Struk Donasi eKhidmah</h2>
                        <p className="text-gray-400 text-sm mt-1">Terima kasih atas kebaikan Anda</p>
                    </div>

                    {/* Amount */}
                    <div className="mx-5 my-5 bg-[#00cacd]/10 rounded-2xl px-5 py-5 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cacd]/70 mb-1">Jumlah Donasi</p>
                        <p className="text-3xl font-extrabold text-[#007b7e]">
                            <span className="text-sm font-bold mr-1">IDR</span>{fmt(donation.amount)}
                        </p>
                        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mt-3">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                            </svg>
                            Berhasil
                        </span>
                    </div>

                    {/* Detail rows */}
                    <div className="px-5 pb-4 space-y-3 border-b border-dashed border-gray-200">
                        {[
                            { label: 'Program', value: donation.campaign?.title ?? '-' },
                            { label: 'Nama Donatur', value: donorDisplay },
                            { label: 'ID Transaksi', value: txId },
                            { label: 'Tanggal', value: dateStr },
                            { label: 'Metode Pembayaran', value: fmtPay(donation.payment_method) },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between items-start gap-3">
                                <span className="text-sm text-gray-400 flex-none">{label}</span>
                                <span className="text-sm font-semibold text-gray-800 text-right leading-snug">{value}</span>
                            </div>
                        ))}
                        {cleanNote && (
                            <div className="bg-gray-50 rounded-2xl px-4 py-3 mt-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Doa &amp; Niat</p>
                                <p className="text-sm text-gray-600 italic">"{cleanNote}"</p>
                            </div>
                        )}
                    </div>

                    {/* QR placeholder */}
                    <div className="px-5 py-6 flex flex-col items-center gap-3">
                        <div className="w-28 h-28 border-2 border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={0.8} className="w-20 h-20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                            </svg>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Pindai untuk Verifikasi Keaslian Struk</p>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4 px-2 leading-relaxed">
                    Bukti transaksi ini diterbitkan secara sah oleh eKhidmah Foundation sebagai tanda terima donasi Anda.
                </p>
            </div>

            {/* Sticky bottom buttons */}
            <div className="fixed bottom-0 left-0 right-0 z-[61] bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-4">
                <div className="max-w-md mx-auto flex gap-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#00cacd]/10 text-[#00cacd] py-4 rounded-2xl font-bold text-sm hover:bg-[#00cacd]/20 transition border border-[#00cacd]/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Simpan
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#00cacd] hover:bg-[#00b8bb] text-white py-4 rounded-2xl font-bold text-sm transition shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                        Bagikan
                    </button>
                </div>
            </div>
        </div>
    );
}

function DonationDetailModal({ donation, onClose, onStatusUpdated, onViewStruk }: {
    donation: Donation | null;
    onClose: () => void;
    onStatusUpdated: (d: Donation) => void;
    onViewStruk: () => void;
}) {
    if (!donation) return null;

    const isAnon = donation.note?.startsWith('[Anonim]');
    const cleanNote = isAnon
        ? (donation.note ?? '').replace('[Anonim]', '').trim()
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
            <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[calc(90vh-4rem)] sm:max-h-[90vh] mb-16 sm:mb-0">
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
                        <span className="text-sm font-semibold text-[#00cacd] font-mono">
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
                        <span className="text-xl font-bold text-[#00cacd]">Rp {fmt(donation.amount)}</span>
                    </div>
                </div>

                {/* Action */}
                <div className="px-6 pb-8 sm:pb-6 pt-2 space-y-2 flex-none border-t border-gray-100">
                    {donation.status === 'success' && (
                        <button
                            onClick={onViewStruk}
                            className="w-full flex items-center justify-center gap-2 bg-[#00cacd]/10 hover:bg-[#00cacd]/20 text-[#00cacd] py-3.5 rounded-2xl font-semibold transition border border-[#00cacd]/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                            </svg>
                            Lihat Struk
                        </button>
                    )}
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
                        className="w-full bg-gradient-to-r from-[#00cacd] to-emerald-600 text-white py-3.5 rounded-2xl font-semibold hover:opacity-90 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MyDonationsPage() {
    const { donations, totalAmount } = usePage<MyDonationsPageProps>().props;
    const [selectedDonation, setSelected]   = useState<Donation | null>(null);
    const [struktDonation, setStruktDonation] = useState<Donation | null>(null);
    const [localTotalAmount, setLocalTotalAmount] = useState(totalAmount);

    const donationList = donations.data;
    const meta = donations;

    const handlePageChange = (p: number) => {
        router.get('/my-donations', { page: p }, { preserveState: true, preserveScroll: true });
    };

    const handleStatusUpdated = (updatedDonation: Donation) => {
        // Reload page data from server
        router.reload({ only: ['donations', 'totalAmount'] });
        setSelected(updatedDonation);
        if (updatedDonation.status === 'success') {
            setLocalTotalAmount(prev => prev + Number(updatedDonation.amount));
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-[#008f92] via-[#00cacd] to-[#00b8bb] px-6 pt-10 pb-14">
                    <p className="text-[#e0fafa] text-sm mb-1">Total Kontribusi Anda</p>
                    <p className="text-4xl font-bold text-white mb-6">
                        Rp {fmt(localTotalAmount)}
                    </p>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-white text-[#00cacd]] px-5 py-2.5 rounded-full text-sm font-semibold shadow">
                            🕐 Riwayat
                        </button>
                        <Link
                            href="/donasi"
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

                    {donationList.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-3">🤲</div>
                            <p className="text-gray-600 font-medium">Belum ada riwayat donasi.</p>
                            <p className="text-gray-400 text-sm mt-1">Yuk mulai berdonasi untuk sesama!</p>
                            <Link
                                href="/donasi"
                                className="mt-4 inline-block bg-gradient-to-r from-[#00cacd]] to-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow"
                            >
                                Lihat Program Donasi
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {donationList.map((d) => {
                                    const initials = (d.campaign?.title ?? 'D').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                                    return (
                                        <button
                                            key={d.id}
                                            onClick={() => setSelected(d)}
                                            className="w-full bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-[#00cacd]/2d]/20 transition text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00cacd]] to-emerald-500 flex items-center justify-center flex-none">
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
                                                    <p className="font-bold text-[#00cacd]] text-sm">Rp {fmt(d.amount)}</p>
                                                    <div className="mt-1"><StatusBadge status={d.status} /></div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <Pagination meta={meta} onPageChange={handlePageChange} />
                        </>
                    )}
                </div>
            </div>

            {/* Donation detail modal */}
            <DonationDetailModal
                donation={selectedDonation}
                onClose={() => setSelected(null)}
                onStatusUpdated={handleStatusUpdated}
                onViewStruk={() => { setStruktDonation(selectedDonation); setSelected(null); }}
            />
            <DonationStruktModal
                donation={struktDonation}
                onClose={() => setStruktDonation(null)}
            />
        </MainLayout>
    );
}
