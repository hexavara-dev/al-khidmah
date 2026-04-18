import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { campaignService } from '../../services/campaignService';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PRESET_AMOUNTS = [
    { value: 10000,  label: 'Sedekah Ringan' },
    { value: 50000,  label: 'Paling Populer' },
    { value: 100000, label: 'Berbagi Berkah' },
    { value: 500000, label: 'Donasi Utama' },
];

const fmt = (n) => Number(n).toLocaleString('id-ID');

const AVATAR_COLORS = [
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
];

export default function CampaignDetailPage() {
    const { id }   = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [campaign, setCampaign]         = useState(null);
    const [loading, setLoading]           = useState(true);
    const [recentDonors, setRecentDonors] = useState([]);
    // step 1=detail, 2=amount+donor, 3=success
    const [step, setStep] = useState(1);

    const [amount, setAmount]             = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [donorName, setDonorName]       = useState('');
    const [anonymous, setAnonymous]       = useState(false);
    const [note, setNote]                 = useState('');
    const [donating, setDonating]         = useState(false);
    const [donation, setDonation]         = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);
    const [showFullDesc, setShowFullDesc]   = useState(false);
    const [showAllDonors, setShowAllDonors] = useState(false);

    useEffect(() => {
        campaignService.getById(id)
            .then(({ data }) => setCampaign(data.data))
            .catch(() => navigate('/donasi'))
            .finally(() => setLoading(false));

        donationService.forCampaign(id)
            .then(({ data }) => setRecentDonors(data.data ?? []))
            .catch(() => {});
    }, [id]);

    useEffect(() => {
        if (user?.name) setDonorName(user.name);
    }, [user]);

    if (loading) return (
        <MainLayout>
            <div className="max-w-2xl mx-auto px-4 py-16 space-y-4 animate-pulse">
                <div className="h-64 bg-gray-200 rounded-2xl" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
        </MainLayout>
    );
    if (!campaign) return null;

    const progress = campaign.target_amount > 0
        ? Math.min(100, (campaign.collected_amount / campaign.target_amount) * 100)
        : 0;
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / 86400000));
    const finalAmount = amount || customAmount;

    const handlePay = async () => {
        if (!user) { navigate('/login'); return; }
        if (!finalAmount || Number(finalAmount) < 1000) { toast.error('Minimal donasi Rp 1.000'); return; }
        setDonating(true);
        try {
            const { data } = await donationService.create({
                campaign_id: campaign.id,
                amount:      Number(finalAmount),
                note:        anonymous ? `[Anonim] ${note}` : note,
            });
            const snapToken = data.snap_token;
            setDonation(data.data);

            if (!snapToken || !window.snap) {
                toast.error('Gagal memuat payment gateway. Coba lagi.');
                setDonating(false);
                return;
            }

            window.snap.pay(snapToken, {
                onSuccess: async (result) => {
                    // Directly confirm payment — trusts Midtrans onSuccess callback
                    try {
                        const bank = result?.va_numbers?.[0]?.bank ?? result?.bank ?? null;
                        const { data: confirmed } = await donationService.confirmPayment(data.data.id, {
                            payment_type: result?.payment_type ?? null,
                            bank,
                        });
                        setDonation(confirmed.data);
                    } catch { /* continue — show success screen regardless */ }
                    setPaymentResult('success');
                    setStep(3);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                onPending: async (result) => {
                    // Bank transfer / certain methods need async confirmation
                    try {
                        await donationService.checkPayment(data.data.id);
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
                    // User dismissed popup WITHOUT completing payment — do NOT show success
                    toast('Pembayaran belum diselesaikan.', { icon: '⚠️' });
                    setDonating(false);
                },
            });
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Gagal membuat donasi.');
            setDonating(false);
        }
    };

    // ── Step 3: Success / Pending ──────────────────────────────────
    if (step === 3) {
        const isSuccess = paymentResult === 'success';
        return (
            <MainLayout>
                <div className="max-w-md mx-auto px-4 py-16 text-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: isSuccess ? '#dbeafe' : '#fef3c7' }}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white font-bold ${
                            isSuccess
                                ? 'bg-gradient-to-br from-blue-400 to-emerald-500'
                                : 'bg-gradient-to-br from-amber-400 to-orange-500'
                        }`}>
                            {isSuccess ? '✓' : '⏳'}
                        </div>
                    </div>

                    {isSuccess ? (
                        <>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Alhamdulillah,<br />Donasi Berhasil!</h1>
                            <p className="text-gray-500 mb-8">Semoga menjadi amal jariyah yang berkah bagi Anda dan keluarga.</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Donasi Dalam Proses</h1>
                            <p className="text-gray-500 mb-8">Pembayaran Anda sedang menunggu konfirmasi. Kami akan memperbarui status setelah pembayaran dikonfirmasi.</p>
                        </>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left space-y-3 mb-6">
                        {donation?.id && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">ID Transaksi</span>
                                <span className="font-semibold text-blue-600">AK-{String(donation.id).padStart(8, '0')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Program Donasi</span>
                            <span className="font-medium text-gray-800 text-right max-w-[55%] leading-tight">{campaign.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Donatur</span>
                            <span className="font-medium text-gray-800">{anonymous ? 'Hamba Allah' : donorName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Status</span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                isSuccess ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {isSuccess ? 'Berhasil' : 'Menunggu Konfirmasi'}
                            </span>
                        </div>
                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Total Donasi</span>
                            <span className="text-xl font-bold text-blue-600">Rp {fmt(finalAmount)}</span>
                        </div>
                        {!isSuccess && (
                            <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2">
                                <span className="text-amber-500">ℹ️</span>
                                <p className="text-xs text-amber-700">Cek riwayat donasi Anda untuk memantau status pembayaran.</p>
                            </div>
                        )}
                        {isSuccess && (
                            <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                                <span className="text-blue-500">✓</span>
                                <p className="text-xs text-blue-700">Donasi Anda akan disalurkan 100% tanpa potongan admin platform.</p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <Link
                            to="/my-donations"
                            className="block w-full bg-gradient-to-r from-blue-500 to-emerald-600 text-white py-3.5 rounded-2xl font-semibold text-center hover:opacity-90 transition"
                        >
                            Lihat Riwayat Donasi
                        </Link>
                        <Link
                            to="/"
                            className="block w-full border-2 border-gray-200 text-gray-600 py-3.5 rounded-2xl font-medium text-center hover:border-blue-300 transition"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
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
                    <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-5">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-none bg-gray-200">
                            {campaign.image
                                ? <img src={`/storage/${campaign.image}`} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-2xl">🕌</div>
                            }
                        </div>
                        <p className="font-semibold text-gray-800 text-sm line-clamp-2">{campaign.title}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {PRESET_AMOUNTS.map((a) => (
                            <button
                                key={a.value}
                                type="button"
                                onClick={() => { setAmount(String(a.value)); setCustomAmount(''); }}
                                className={`p-3 rounded-2xl border-2 text-left transition ${
                                    amount === String(a.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'
                                }`}
                            >
                                <p className={`font-bold text-sm ${amount === String(a.value) ? 'text-blue-700' : 'text-gray-800'}`}>
                                    Rp {fmt(a.value)}
                                </p>
                                <p className="text-xs text-gray-400">{a.label}</p>
                            </button>
                        ))}
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
                            className="w-full border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
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
                                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setAnonymous(!anonymous)}
                            className="flex items-center gap-3 w-full p-3 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-blue-200 transition"
                        >
                            <div className={`w-11 h-6 rounded-full transition-colors relative flex-none ${anonymous ? 'bg-blue-500' : 'bg-gray-300'}`}>
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
                                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 resize-none"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-600 text-sm font-medium">Total Donasi</span>
                            <span className="text-xl font-bold text-blue-700">
                                {finalAmount ? `Rp ${fmt(finalAmount)}` : 'Rp 0'}
                            </span>
                        </div>
                        {!user && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                                ⚠️ Anda perlu <Link to="/login" className="font-semibold underline">login</Link> untuk melanjutkan donasi.
                            </p>
                        )}
                        <button
                            onClick={handlePay}
                            disabled={donating || !finalAmount}
                            className="w-full bg-gradient-to-r from-blue-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-base hover:opacity-90 transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
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
                        <div className="w-full h-64 md:h-72 bg-gradient-to-br from-blue-100 to-emerald-200 flex items-center justify-center text-8xl">
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
                                <p className="text-2xl font-bold text-blue-700">Rp {fmt(campaign.collected_amount)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Target</p>
                                <p className="text-sm font-semibold text-gray-600">Rp {fmt(campaign.target_amount)}</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
                            <div className="px-2">
                                <p className="text-base font-bold text-blue-700">{progress.toFixed(0)}%</p>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Progres</p>
                            </div>
                            <div className="px-2">
                                <p className="text-base font-bold text-blue-700">
                                    {(campaign.donations_count ?? 0).toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Donatur</p>
                            </div>
                            <div className="px-2">
                                <p className="text-base font-bold text-blue-700">{daysLeft}</p>
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
                            className="text-blue-600 text-xs mt-2 font-medium"
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
                                        className="text-xs text-blue-600 font-medium hover:underline"
                                    >
                                        {showAllDonors ? 'Sembunyikan' : `Lihat Semua (${recentDonors.length})`}
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {(showAllDonors ? recentDonors : recentDonors.slice(0, 3)).map((d, i) => {
                                    const initials = d.donor_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                                    const hoursAgo = Math.floor((Date.now() - new Date(d.created_at)) / 3600000);
                                    const timeStr  = hoursAgo < 1
                                        ? 'Baru saja'
                                        : hoursAgo < 24
                                            ? `${hoursAgo} jam yang lalu`
                                            : new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                                    return (
                                        <div key={d.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 hover:bg-blue-50 transition">
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
                                                <p className="text-sm font-bold text-blue-600">Rp {fmt(d.amount)}</p>
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
                           className="w-full bg-blue-600 text-white text-xs font-semibold py-4 rounded-xl text-center"
                        >
                            🤲 Donasi Sekarang
                        </button>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
