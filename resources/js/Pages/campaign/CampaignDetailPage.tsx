import { useEffect, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { donationService } from '../../services/donationService';
import toast from 'react-hot-toast';
import type { Campaign, Donor, Donation, PageProps } from '../../types';

interface CampaignDetailPageProps extends PageProps {
    campaign: Campaign;
    donors: Donor[];
    midtrans: {
        snapJsUrl: string;
        clientKey: string;
    };
}

const PRESET_AMOUNTS = [
    { value: 10000,  label: 'Sedekah Ringan', icon: '🌱' },
    { value: 50000,  label: 'Paling Populer', icon: '⭐', popular: true },
    { value: 100000, label: 'Berbagi Berkah', icon: '🤲' },
    { value: 500000, label: 'Donasi Utama',   icon: '💎' },
];

const fmt = (n: number | string) => Number(n).toLocaleString('id-ID');

const AVATAR_COLORS = [
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
];

export default function CampaignDetailPage() {
    const { auth, midtrans, campaign, donors } = usePage<CampaignDetailPageProps>().props;
    const user = auth?.user;
    const [recentDonors] = useState<Donor[]>(donors ?? []);
    // step 1=detail, 2=amount+donor, 3=success
    const [step, setStep] = useState(1);

    const [amount, setAmount]             = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [donorName, setDonorName]       = useState('');
    const [anonymous, setAnonymous]       = useState(false);
    const [note, setNote]                 = useState('');
    const [donating, setDonating]         = useState(false);
    const [donation, setDonation]         = useState<Donation | null>(null);
    const [paymentResult, setPaymentResult] = useState<string | null>(null);
    const [showFullDesc, setShowFullDesc]   = useState(false);
    const [showAllDonors, setShowAllDonors] = useState(false);
    const [showStruk, setShowStruk]         = useState(false);

    // Load Midtrans Snap JS dynamically
    useEffect(() => {
        if (midtrans?.snapJsUrl && !document.querySelector('script[src*="snap.js"]')) {
            const script = document.createElement('script');
            script.src = midtrans.snapJsUrl;
            script.dataset.clientKey = midtrans.clientKey;
            script.async = true;
            document.head.appendChild(script);
        }
    }, [midtrans]);

    useEffect(() => {
        if (user?.name) setDonorName(user.name);
    }, [user]);

    if (!campaign) return null;

    const hasTarget = campaign.target_amount != null && Number(campaign.target_amount) > 0;
    const progress = hasTarget
        ? Math.min(100, (campaign.collected_amount / campaign.target_amount) * 100)
        : 0;
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000));
    const finalAmount = amount || customAmount;

    const handlePay = async () => {
        if (!user) { router.visit('/login'); return; }
        if (!finalAmount || Number(finalAmount) < 1000) { toast.error('Minimal donasi Rp 1.000'); return; }
        setDonating(true);
        try {
            const { data: resp } = await donationService.create({
                campaign_id: campaign.id,
                amount:      Number(finalAmount),
                note:        anonymous ? `[Anonim] ${note}` : note,
            });
            const snapToken = resp.snap_token;
            setDonation(resp.data);

            if (!snapToken || !window.snap) {
                toast.error('Gagal memuat payment gateway. Coba lagi.');
                setDonating(false);
                return;
            }

            window.snap.pay(snapToken, {
                onSuccess: async (result) => {
                    try {
                        const bank = result?.va_numbers?.[0]?.bank ?? result?.bank ?? null;
                        const { data: confirmed } = await donationService.confirmPayment(resp.data.id, {
                            payment_type: result?.payment_type ?? null,
                            bank,
                        });
                        setDonation(confirmed.data);
                    } catch { /* continue */ }
                    setPaymentResult('success');
                    setStep(3);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                onPending: async () => {
                    try {
                        await donationService.checkPayment(resp.data.id);
                    } catch { /* ignore */ }
                    setPaymentResult('pending');
                    setStep(3);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                onError: () => {
                    toast.error('Pembayaran gagal. Silakan coba lagi.');
                    setDonating(false);
                },
                onClose: () => {
                    toast('Pembayaran belum diselesaikan.', { icon: '⚠️' });
                    setDonating(false);
                },
            });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal membuat donasi.';
            toast.error(message);
            setDonating(false);
        }
    };

    // ── Step 3: Success / Pending ──────────────────────────────────
    if (step === 3) {
        const isSuccess = paymentResult === 'success';
        const fmtPay = (m: string | null | undefined): string => {
            if (!m || m === '-') return '-';
            const map: Record<string, string> = { bca_va: 'BCA VA', bni_va: 'BNI VA', mandiri_va: 'Mandiri VA', bri_va: 'BRI VA', gopay: 'GoPay', shopeepay: 'ShopeePay', qris: 'QRIS', indomaret: 'Indomaret', alfamart: 'Alfamart', credit_card: 'Kartu Kredit', bank_transfer: 'Transfer Bank', cstore: 'Minimarket', echannel: 'Mandiri Bill' };
            return map[m.toLowerCase()] ?? m.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        };
        const paidAt = donation?.updated_at ? new Date(donation.updated_at) : new Date();
        const dateStr = paidAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + paidAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const txId = `AK-${String(donation?.id ?? 0).padStart(10, '0')}`;
        const donorDisplay = anonymous ? 'Hamba Allah' : donorName;
        const rawNote = (donation?.note ?? note ?? '').replace('[Anonim]', '').trim();

        // ── Struk / Receipt subview ───────────────────────────────
        if (showStruk) {
            const handleSave = () => {
                toast('Membuka tampilan cetak...', { icon: '🖨️' });
                setTimeout(() => window.print(), 300);
            };
            const handleShare = async () => {
                const text = `Alhamdulillah, saya baru berdonasi Rp ${fmt(finalAmount)} untuk "${campaign.title}" melalui eKhidmah. Mari bersama berbuat kebaikan! 🤲`;
                if (navigator.share) {
                    try { await navigator.share({ title: 'Struk Donasi eKhidmah', text }); } catch { /* cancelled */ }
                } else {
                    await navigator.clipboard.writeText(text);
                    toast.success('Teks donasi disalin!');
                }
            };
            return (
                <MainLayout>
                    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-52 md:pb-36">
                        {/* Header */}
                        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                            <button onClick={() => setShowStruk(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
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

                        <div className="px-4 py-5">
                            {/* Struk card */}
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
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cacd] mb-1">Jumlah Donasi</p>
                                    <p className="text-3xl font-extrabold text-[#008f92]">
                                        <span className="text-sm font-bold mr-1">IDR</span>{fmt(finalAmount)}
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
                                        { label: 'Program', value: campaign.title },
                                        { label: 'Nama Donatur', value: donorDisplay },
                                        { label: 'ID Transaksi', value: txId },
                                        { label: 'Tanggal', value: dateStr },
                                        { label: 'Metode Pembayaran', value: fmtPay(donation?.payment_method) },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-start gap-3">
                                            <span className="text-sm text-gray-400 flex-none">{label}</span>
                                            <span className="text-sm font-semibold text-gray-800 text-right leading-snug">{value}</span>
                                        </div>
                                    ))}
                                    {rawNote && (
                                        <div className="bg-gray-50 rounded-2xl px-4 py-3 mt-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Doa &amp; Niat</p>
                                            <p className="text-sm text-gray-600 italic">"{rawNote}"</p>
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
                    </div>

                    {/* Sticky bottom buttons */}
                    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-[51] bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-4">
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
                </MainLayout>
            );
        }

        // ── Success / Pending screen ──────────────────────────────
        return (
            <MainLayout>
                <div className="max-w-md mx-auto px-4 pt-12 pb-10 text-center bg-gray-50 min-h-screen">
                    {/* Checkmark icon */}
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: isSuccess ? '#ccfbf1' : '#fef3c7' }}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isSuccess ? 'bg-teal-400' : 'bg-amber-400'}`}>
                            {isSuccess ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {isSuccess ? (
                        <>
                            <h1 className="text-2xl font-extrabold text-[#008f92] mb-3 leading-snug">
                                Alhamdulillah, Donasi<br />Berhasil!
                            </h1>
                            <p className="text-gray-500 text-sm mb-8">Semoga menjadi amal jariyah yang berkah<br />bagi Anda dan keluarga.</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-extrabold text-[#008f92] mb-3">Donasi Dalam Proses</h1>
                            <p className="text-gray-500 text-sm mb-8">Pembayaran sedang menunggu konfirmasi.</p>
                        </>
                    )}

                    {/* Transaction card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 text-left overflow-hidden mb-5">
                        {donation?.id && (
                            <div className="px-5 py-4 flex justify-between items-center border-b border-gray-50">
                                <span className="text-sm text-gray-400">ID Transaksi</span>
                                <span className="text-sm font-bold text-[#00cacd] font-mono">{txId}</span>
                            </div>
                        )}
                        <div className="px-5 py-4 border-b border-gray-50">
                            <p className="text-xs text-gray-400 mb-0.5">Program Donasi</p>
                            <p className="font-bold text-gray-800 text-sm leading-snug">{campaign.title}</p>
                        </div>
                        <div className="px-5 py-4 flex gap-4 border-b border-gray-50">
                            <div className="flex-1 text-left">
                                <p className="text-xs text-gray-400 mb-0.5">Tanggal</p>
                                <p className="font-bold text-gray-800 text-sm leading-snug">{dateStr}</p>
                            </div>
                            {donation?.payment_method && (
                                <div className="flex-1 text-right">
                                    <p className="text-xs text-gray-400 mb-0.5">Metode</p>
                                    <p className="font-bold text-gray-800 text-sm">{fmtPay(donation.payment_method)}</p>
                                </div>
                            )}
                        </div>
                        <div className="mx-4 my-4 bg-gray-50 rounded-2xl px-5 py-4 flex items-center justify-between">
                            <span className="font-bold text-gray-700 text-sm">Total Donasi</span>
                            <p className="font-extrabold text-[#00cacd] text-lg">
                                <span className="text-xs font-bold mr-1">IDR</span>{fmt(finalAmount)}
                            </p>
                        </div>
                        {isSuccess && (
                            <div className="mx-4 mb-4 border-t border-dashed border-gray-200 pt-4 flex items-start gap-3">
                                {campaign.image ? (
                                    <img src={`/storage/${campaign.image}`} alt="" className="w-14 h-14 rounded-xl object-cover flex-none" />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-[#00cacd]/10 flex items-center justify-center flex-none text-2xl">🕌</div>
                                )}
                                <div>
                                    <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1">Terverifikasi</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">Donasi Anda akan disalurkan 100% tanpa potongan admin platform.</p>
                                </div>
                            </div>
                        )}
                        {!isSuccess && (
                            <div className="mx-4 mb-4 bg-amber-50 rounded-2xl p-3 flex items-start gap-2">
                                <span className="text-amber-500">ℹ️</span>
                                <p className="text-xs text-amber-700">Cek riwayat donasi Anda untuk memantau status pembayaran.</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {isSuccess && (
                            <button
                                onClick={() => setShowStruk(true)}
                                className="w-full bg-[#00cacd] hover:bg-[#00b8bb] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                                </svg>
                                Lihat Struk
                            </button>
                        )}
                        <Link
                            href="/donasi"
                            className="block w-full bg-[#00cacd]/10 hover:bg-[#00cacd]/20 text-[#00cacd] py-4 rounded-2xl font-bold text-center transition border border-[#00cacd]/20"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                    <p className="mt-6 text-xs text-gray-400">
                        Butuh bantuan?{' '}
                        <button className="text-[#00cacd] font-semibold hover:underline">Hubungi Support</button>
                    </p>
                </div>
            </MainLayout>
        );
    }

    // ── Step 2: Amount + donor info ───────────────────────────────
    if (step === 2) {
        return (
            <MainLayout>
                <div className="max-w-lg mx-auto px-4 py-8">
                    <button onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
                        ← Kembali
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Pilih Nominal Donasi</h2>
                    <p className="text-xs text-gray-400 mb-4">Minimum donasi Rp 1.000</p>

                    {/* Campaign mini card */}
                    <div className="flex items-center gap-3 bg-[#00cacd]/10 rounded-2xl p-4 border border-[#00cacd]/20 mb-5">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-none bg-gray-200">
                            {campaign.image
                                ? <img src={`/storage/${campaign.image}`} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-2xl">🕌</div>
                            }
                        </div>
                        <p className="font-semibold text-gray-800 text-sm line-clamp-2">{campaign.title}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {PRESET_AMOUNTS.map((a) => {
                            const selected = amount === String(a.value);
                            return (
                                <button
                                    key={a.value}
                                    type="button"
                                    onClick={() => { setAmount(String(a.value)); setCustomAmount(''); }}
                                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                                        selected
                                            ? 'border-[#00cacd] bg-gradient-to-br from-[#00cacd] to-[#00b8bb] shadow-md shadow-[#00cacd]/30'
                                            : 'border-gray-100 bg-white hover:border-[#00cacd]/40 hover:shadow-sm'
                                    }`}
                                >
                                    {a.popular && !selected && (
                                        <span className="absolute -top-2 left-3 bg-amber-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            Populer
                                        </span>
                                    )}
                                    {selected && (
                                        <span className="absolute top-2 right-2 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    )}
                                    <span className="text-xl mb-2 block">{a.icon}</span>
                                    <p className={`font-extrabold text-sm leading-tight ${
                                        selected ? 'text-white' : 'text-gray-800'
                                    }`}>
                                        Rp {fmt(a.value)}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${
                                        selected ? 'text-[#e0fafa]' : 'text-gray-400'
                                    }`}>{a.label}</p>
                                </button>
                            );
                        })}
                    </div>

                    <label className="block text-xs text-gray-400 mb-1">Atau input manual</label>
                    <div className="relative mb-6">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
                        <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => { setCustomAmount(e.target.value); setAmount(''); }}
                            min="1000"
                            placeholder="0"
                            className="w-full border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00cacd] bg-gray-50"
                        />
                    </div>

                    <h2 className="font-bold text-gray-800 mb-3">Data Donatur</h2>
                    <div className="space-y-3 mb-6">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                placeholder="Masukkan nama Anda"
                                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#00cacd] bg-gray-50"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setAnonymous(!anonymous)}
                            className="flex items-center gap-3 w-full p-3 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-[#00cacd]/30 transition"
                        >
                            <div className={`w-11 h-6 rounded-full transition-colors relative flex-none ${anonymous ? 'bg-[#00cacd]' : 'bg-gray-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${anonymous ? 'left-5' : 'left-0.5'}`} />
                            </div>
                            <span className="text-sm text-gray-600">Sembunyikan nama saya (Anonim)</span>
                        </button>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Doa dan Niat (Opsional)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                placeholder="Tuliskan doa atau niat baik Anda di sini..."
                                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#00cacd] bg-gray-50 resize-none"
                            />
                        </div>
                    </div>

                    <div className="bg-[#00cacd]/10 rounded-2xl p-4 border border-[#00cacd]/20">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-600 text-sm font-medium">Total Donasi</span>
                            <span className="text-xl font-bold text-[#00cacd]">
                                {finalAmount ? `Rp ${fmt(finalAmount)}` : 'Rp 0'}
                            </span>
                        </div>
                        {!user && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                                ⚠️ Anda perlu <Link href="/login" className="font-semibold underline">login</Link> untuk melanjutkan donasi.
                            </p>
                        )}
                        <button
                            onClick={handlePay}
                            disabled={donating || !finalAmount}
                            className="w-full bg-gradient-to-r from-[#00cacd] to-emerald-600 text-white py-4 rounded-2xl font-bold text-base hover:opacity-90 transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {donating ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                <>🔒 Bayar Sekarang — Rp {fmt(finalAmount || 0)}</>
                            )}
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // ── Step 1: Campaign detail ────────────────────────────────────
    const isUrgent = daysLeft > 0 && daysLeft <= 7;

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto pb-8">

                {/* Hero image */}
                <div className="relative">
                    {campaign.image ? (
                        <img src={`/storage/${campaign.image}`} alt={campaign.title} className="w-full h-64 md:h-72 object-cover" />
                    ) : (
                        <div className="w-full h-64 md:h-72 bg-gradient-to-br from-[#00cacd]/20 to-emerald-200 flex items-center justify-center text-8xl">
                            🕌
                        </div>
                    )}
                    <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full text-white uppercase tracking-wide shadow ${
                        isUrgent ? 'bg-red-500' : 'bg-emerald-500'
                    }`}>
                        {isUrgent ? 'Mendesak' : (campaign.category?.name ?? 'Aktif')}
                    </span>
                    {daysLeft > 0 && (
                        <span className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                            ⏰ {daysLeft} Hari Lagi
                        </span>
                    )}
                </div>

                <div className="px-4 py-5 space-y-5">
                    {/* Title */}
                    <h1 className="text-xl font-bold text-gray-800 leading-snug">{campaign.title}</h1>

                    {/* Stats card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Terkumpul</p>
                                <p className="text-2xl font-bold text-[#00cacd]">Rp {fmt(campaign.collected_amount)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Target</p>
                                <p className="text-sm font-semibold text-gray-600">
                                    {hasTarget ? `Rp ${fmt(campaign.target_amount)}` : 'Tak Terbatas'}
                                </p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                            <div
                                className="bg-gradient-to-r from-[#00cacd] to-emerald-500 h-2.5 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
                            <div className="px-2">
                                <p className="text-base font-bold text-[#00cacd]">{progress.toFixed(0)}%</p>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Progres</p>
                            </div>
                            <div className="px-2">
                                <p className="text-base font-bold text-[#00cacd]">
                                    {(campaign.donations_count ?? 0).toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Donatur</p>
                            </div>
                            <div className="px-2">
                                <p className="text-base font-bold text-[#00cacd]">{daysLeft}</p>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Hari Lagi</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-2">Tentang Kampanye</h2>
                        <p className={`text-gray-600 text-sm leading-relaxed whitespace-pre-line ${showFullDesc ? '' : 'line-clamp-4'}`}>
                            {campaign.description}
                        </p>
                        <button
                            onClick={() => setShowFullDesc(!showFullDesc)}
                            className="text-[#00cacd] text-xs mt-2 font-medium"
                        >
                            {showFullDesc ? 'Tutup ▴' : 'Baca Selengkapnya ▾'}
                        </button>
                    </div>

                    {/* Recent donors */}
                    {recentDonors.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-base font-bold text-gray-800">Donatur Terbaru</h2>
                                {recentDonors.length > 3 && (
                                    <button
                                        onClick={() => setShowAllDonors(v => !v)}
                                        className="text-xs text-[#00cacd] font-medium hover:underline"
                                    >
                                        {showAllDonors ? 'Sembunyikan' : `Lihat Semua (${recentDonors.length})`}
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {(showAllDonors ? recentDonors : recentDonors.slice(0, 3)).map((d, i) => {
                                    const initials = d.donor_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                                    const hoursAgo = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 3600000);
                                    const timeStr  = hoursAgo < 1
                                        ? 'Baru saja'
                                        : hoursAgo < 24
                                            ? `${hoursAgo} jam yang lalu`
                                            : new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                                    return (
                                        <div key={d.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 hover:bg-[#00cacd]/10 transition">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center flex-none shadow-sm`}>
                                                <span className="text-white text-xs font-bold">{initials}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{d.donor_name}</p>
                                                {d.note && (
                                                    <p className="text-xs text-gray-400 italic truncate">"{d.note}"</p>
                                                )}
                                                <p className="text-xs text-gray-300">{timeStr}</p>
                                            </div>
                                            <div className="flex-none">
                                                <p className="text-sm font-bold text-[#00cacd]">Rp {fmt(d.amount)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Campaign ended notice */}
                    {(!campaign.is_active || daysLeft <= 0) && (
                        <div className="bg-gray-100 rounded-2xl p-6 text-center">
                            <p className="text-4xl mb-3">🕌</p>
                            <p className="text-gray-600 font-medium">Campaign ini sudah berakhir atau tidak aktif.</p>
                            <p className="text-gray-400 text-sm mt-1">Terima kasih atas dukungan Anda!</p>
                        </div>
                    )}

                    {/* Donate button - inside content */}
                    {campaign.is_active && daysLeft > 0 && (
                        <button
                            onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-full bg-[#00cacd] hover:bg-[#00b8bb] text-white text-xs font-semibold py-4 rounded-xl text-center transition-all active:scale-95"
                        >
                            🤲 Donasi Sekarang
                        </button>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
