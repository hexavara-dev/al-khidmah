import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { campaignService } from '@/services/campaignService';
import { categoryService } from '@/services/categoryService';
import { donationService } from '@/services/donationService';
import { userService } from '@/services/userService';

const STAT_CARDS = [
    {
        label: 'Total Campaign', icon: '📢', key: 'campaigns',
        link: '/admin/donations/campaigns',
        color: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50', text: 'text-blue-600',
        desc: 'Campaign aktif & nonaktif',
    },
    {
        label: 'Total Kategori', icon: '🏷️', key: 'categories',
        link: '/admin/donations/categories',
        color: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50', text: 'text-purple-600',
        desc: 'Kategori kampanye',
    },
    {
        label: 'Total Donasi', icon: '💳', key: 'donations',
        link: '/admin/donations',
        color: 'from-emerald-500 to-blue-600',
        bg: 'bg-emerald-50', text: 'text-emerald-600',
        desc: 'Semua transaksi masuk',
    },
    {
        label: 'Total Pengguna', icon: '👥', key: 'users',
        link: '/admin/users',
        color: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-50', text: 'text-orange-600',
        desc: 'Pengguna terdaftar',
    },
];

export default function DashboardOverviewPage() {
    const [stats, setStats] = useState({ campaigns: null, categories: null, donations: null, users: null });
    const [recentDonations, setRecentDonations] = useState([]);

    useEffect(() => {
        Promise.all([
            campaignService.getAll({ page: 1 }),
            categoryService.getAll(),
            donationService.getAll({ page: 1 }),
            userService.getAll({ page: 1 }),
        ]).then(([camps, cats, dons, users]) => {
            setStats({
                campaigns:  camps.data.data.total,
                categories: cats.data.data.length,
                donations:  dons.data.data.total,
                users:      users.data.data.total,
            });
            setRecentDonations(dons.data.data.data?.slice(0, 5) ?? []);
        }).catch(() => {});
    }, []);

    return (
        <AdminLayout breadcrumbs={[{ label: 'Overview' }]}>
            <Head title="Overview Dashboard" />
            <div className="relative mb-8 bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-500 rounded-2xl p-7 text-white overflow-hidden shadow-lg">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-6 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute top-4 right-32 w-8 h-8 bg-white/10 rounded-full animate-pulse" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-1">Panel Admin · Al Khidmah</p>
                        <h2 className="text-3xl font-bold">Selamat Datang! 👋</h2>
                        <p className="text-emerald-100/80 text-sm mt-1.5 max-w-sm">Pantau dan kelola semua aktivitas platform donasi dari sini.</p>
                    </div>
                    {/* <div className="flex gap-3 flex-shrink-0">
                        <Link to="/dashboard/campaigns" className="bg-white/20 hover:bg-white/30 transition text-white text-xs font-medium px-4 py-2 rounded-xl backdrop-blur-sm">
                            + Campaign
                        </Link>
                        <Link to="/dashboard/users" className="bg-white/20 hover:bg-white/30 transition text-white text-xs font-medium px-4 py-2 rounded-xl backdrop-blur-sm">
                            + User
                        </Link>
                    </div> */}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {STAT_CARDS.map((card, i) => (
                    <Link
                        key={card.key}
                        href={card.link}
                        className="group relative bg-white rounded-2xl border border-gray-100 shadow-md p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        {/* Top color bar — slides in on hover */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                {card.icon}
                            </div>
                            <span className={`text-xs font-semibold ${card.text} opacity-0 group-hover:opacity-100 transition-all duration-200`}>Kelola →</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 mb-1">
                            {stats[card.key] === null ? (
                                <span className="inline-block w-12 h-7 bg-gray-200 animate-pulse rounded" />
                            ) : stats[card.key]}
                        </p>
                        <p className="text-sm font-semibold text-gray-700">{card.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Donations */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <h3 className="font-semibold text-gray-800">Donasi Terbaru</h3>
                    </div>
                    <Link href="/admin/donations" className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition">
                        Lihat semua →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Donatur</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nominal</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentDonations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                                        <div className="text-3xl mb-2">💳</div>
                                        <p>Belum ada donasi masuk</p>
                                    </td>
                                </tr>
                            ) : recentDonations.map((d, i) => (
                                <tr
                                    key={d.id}
                                    className="hover:bg-emerald-50/40 transition-colors duration-150"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {(d.user?.name ?? 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-800">{d.user?.name ?? 'Anonim'}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500 max-w-[160px] truncate">{d.campaign?.title ?? '-'}</td>
                                    <td className="px-5 py-3.5 font-semibold text-emerald-700">
                                        Rp {Number(d.amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                            d.status === 'success' ? 'bg-blue-100 text-blue-700' :
                                            d.status === 'failed'  ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'success' ? 'bg-blue-500' : d.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                            {d.status === 'success' ? 'Sukses' : d.status === 'failed' ? 'Gagal' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
