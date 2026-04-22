import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/components/Pagination';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { donationService } from '@/services/donationService';
import { reportService } from '@/services/reportService';
import { Head } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { FileDown, Search } from 'lucide-react';

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
    return map[method.toLowerCase()] ?? method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

interface Donation {
    id: number;
    user?: { name: string };
    campaign?: { title: string };
    amount: number | string;
    payment_method: string | null;
    created_at: string;
    status: 'success' | 'pending' | 'failed';
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    data: Donation[];
}

export default function AdminDonationsPage() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [meta, setMeta]           = useState<PaginationMeta | null>(null);
    const [page, setPage]           = useState(1);
    const [search, setSearch]       = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMonth, setFilterMonth]   = useState('');
    const [loading, setLoading]     = useState(true);
    const [downloading, setDownloading] = useState(false);

    const load = (p: number, s: string, status: string, month: string) => {
        setLoading(true);
        donationService.getAll({
            page: p,
            per_page: 10,
            ...(s      ? { search: s }  : {}),
            ...(status ? { status }     : {}),
            ...(month  ? { month }      : {}),
        })
        .then(({ data }: { data: { data: PaginationMeta } }) => {
            setDonations(data.data.data);
            setMeta(data.data);
        })
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        load(page, search, filterStatus, filterMonth);
    }, [page, search, filterStatus, filterMonth]);

    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            const params: Record<string, string> = {};
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
        <AdminLayout breadcrumbs={[{ label: 'Donasi', href: '/admin/donations' }, { label: 'Manajemen Donasi' }]}>
            <Head title="Manajemen Donasi" />

            <div className="space-y-6">
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Manajemen Donasi</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Lihat dan kelola semua transaksi donasi
                        </p>
                    </div>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={downloading}
                        className="self-start inline-flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors shadow-sm disabled:opacity-60"
                    >
                        {downloading ? (
                            <span>Mengunduh...</span>
                        ) : (
                            <>
                                <FileDown className="h-4 w-4" />
                                <span>Unduh PDF</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Main card */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle>Daftar Donasi</CardTitle>
                        <CardDescription>Semua transaksi donasi yang masuk ke sistem</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Search / Filter toolbar */}
                        <div className="px-6 py-4 border-b flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari donatur atau campaign..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <input
                                type="month"
                                value={filterMonth}
                                onChange={(e) => { setFilterMonth(e.target.value); setPage(1); }}
                                className="border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]"
                                title="Filter berdasarkan bulan"
                            />
                            <select
                                value={filterStatus}
                                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                                className="border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="success">Sukses</option>
                                <option value="failed">Gagal</option>
                            </select>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Donatur</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campaign</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nominal</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metode</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                {[...Array(6)].map((__, j) => (
                                                    <td key={j} className="px-6 py-4">
                                                        <div className="h-4 bg-muted rounded w-24" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : donations.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                                Belum ada data donasi
                                            </td>
                                        </tr>
                                    ) : donations.map((d) => (
                                        <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-3 font-medium">{d.user?.name ?? 'Anonim'}</td>
                                            <td className="px-6 py-3 text-muted-foreground max-w-[180px] truncate">{d.campaign?.title ?? '-'}</td>
                                            <td className="px-6 py-3 font-semibold text-emerald-600">
                                                Rp {Number(d.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-3 text-muted-foreground">
                                                {formatPaymentMethod(d.payment_method)}
                                            </td>
                                            <td className="px-6 py-3 text-muted-foreground text-xs">
                                                {new Date(d.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    d.status === 'success'
                                                        ? 'bg-green-100 text-green-700'
                                                        : d.status === 'failed'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {d.status === 'success' ? 'Sukses' : d.status === 'failed' ? 'Gagal' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {meta && donations.length > 0 && (
                            <div className="px-6 py-4 border-t">
                                <Pagination meta={meta} onPageChange={setPage} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
