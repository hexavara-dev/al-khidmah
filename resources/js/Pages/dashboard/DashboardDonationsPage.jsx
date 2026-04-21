import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Pagination from '../../components/Pagination';
import { donationService } from '../../services/donationService';
import { reportService } from '../../services/reportService';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'success', 'failed'];

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

export default function DashboardDonationsPage() {
    const [donations, setDonations] = useState([]);
    const [meta, setMeta]           = useState(null);
    const [page, setPage]           = useState(1);
    const [search, setSearch]       = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMonth, setFilterMonth]   = useState('');
    const [loading, setLoading]     = useState(true);
    const [updating, setUpdating]   = useState(null);
    const [downloading, setDownloading] = useState(false);

    const load = (p, s, status, month) => {
        setLoading(true);
        donationService.getAll({
            page: p,
            per_page: 10,
            ...(s      ? { search: s }  : {}),
            ...(status ? { status }     : {}),
            ...(month  ? { month }      : {}),
        })
        .then(({ data }) => { setDonations(data.data.data); setMeta(data.data); })
        .finally(() => setLoading(false));
    };

    useEffect(() => { load(page, search, filterStatus, filterMonth); }, [page, search, filterStatus, filterMonth]);

    const handleStatusChange = async (donation, status) => {
        setUpdating(donation.id);
        try {
            await donationService.updateStatus(donation.id, status);
            toast.success('Status donasi diperbarui.');
            load(page, search, filterStatus, filterMonth);
        } catch {
            toast.error('Gagal memperbarui status.');
        } finally {
            setUpdating(null);
        }
    };

    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            const params = {};
            if (filterMonth)  params.month  = filterMonth;
            if (filterStatus) params.status = filterStatus;
            await reportService.downloadDonationPdf(params);
            toast.success('Laporan PDF berhasil diunduh.');
        } catch {
            toast.error('Gagal mengunduh laporan.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manajemen Donasi</h2>
                    <p className="text-sm text-gray-500 mt-1">Lihat dan ubah status semua transaksi donasi</p>
                </div>
                <button
    onClick={handleDownloadPdf}
    disabled={downloading}
    className="self-start flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
>
    {downloading ? (
        '⏳ Mengunduh...'
    ) : (
        <>
            <span>📄</span>
            <span>Unduh PDF</span>
        </>
    )}
</button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Search / Filter toolbar */}
                <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">🔍</span>
                        <input
                            type="text"
                            placeholder="Cari donatur atau campaign..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <input
                        type="month"
                        value={filterMonth}
                        onChange={(e) => { setFilterMonth(e.target.value); setPage(1); }}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px] bg-white"
                        title="Filter berdasarkan bulan"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px] bg-white"
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="success">✅ Sukses</option>
                        <option value="failed">❌ Gagal</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Donatur</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Campaign</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nominal</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Metode</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                {/* <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ubah Status</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(7)].map((__, j) => (
                                            <td key={j} className="px-5 py-3">
                                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : donations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                        Belum ada data donasi
                                    </td>
                                </tr>
                            ) : donations.map((d) => (
                                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-gray-800">{d.user?.name ?? 'Anonim'}</td>
                                    <td className="px-5 py-3 text-gray-500 max-w-[150px] truncate">{d.campaign?.title ?? '-'}</td>
                                    <td className="px-5 py-3 font-semibold text-emerald-700">
                                        Rp {Number(d.amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">
                                        {formatPaymentMethod(d.payment_method)}
                                    </td>
                                    <td className="px-5 py-3 text-gray-400 text-xs">
                                        {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                            d.status === 'success' ? 'bg-blue-100 text-blue-700' :
                                            d.status === 'failed'  ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {d.status === 'success' ? '✅ Sukses' : d.status === 'failed' ? '❌ Gagal' : '⏳ Pending'}
                                        </span>
                                    </td>
                                    {/* <td className="px-5 py-3">
                                        <select
                                            value={d.status}
                                            disabled={updating === d.id}
                                            onChange={(e) => handleStatusChange(d, e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {meta && donations.length > 0 && (
                <div className="mt-6">
                    <Pagination meta={meta} onPageChange={setPage} />
                </div>
            )}
        </DashboardLayout>
    );
}
