import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import CampaignCard from '../../components/CampaignCard';
import Pagination from '../../components/Pagination';
import type { Campaign, Category, PaginatedData, PageProps } from '../../types';

interface HomePageProps extends PageProps {
    campaigns: PaginatedData<Campaign>;
    categories: Category[];
    totalKontribusi: number;
    filters: {
        search?: string;
        category_id?: string;
        is_active?: string;
    };
}

const CATEGORY_ICONS: Record<string, { emoji: string; bg: string; color: string }> = {
    'Pendidikan': { emoji: '📚', bg: 'bg-blue-100', color: 'text-blue-600' },
    'Kesehatan':  { emoji: '🏥', bg: 'bg-red-100',  color: 'text-red-600' },
    'Bencana Alam': { emoji: '🌊', bg: 'bg-cyan-100', color: 'text-cyan-600' },
    'Yatim & Dhuafa': { emoji: '🤲', bg: 'bg-orange-100', color: 'text-orange-600' },
    'Masjid & Pesantren': { emoji: '🕌', bg: 'bg-teal-100', color: 'text-teal-700' },
    'Lingkungan': { emoji: '🌿', bg: 'bg-green-100', color: 'text-green-600' },
    'Masjid': { emoji: '🕌', bg: 'bg-teal-100', color: 'text-teal-700' },
    'Anak Yatim': { emoji: '🧒', bg: 'bg-orange-100', color: 'text-orange-600' },
};

const fmt = (n: number) => Number(n).toLocaleString('id-ID');

export default function HomePage() {
    const { auth, campaigns, categories, totalKontribusi, filters } = usePage<HomePageProps>().props;
    const user = auth?.user;
    const campaignList = campaigns.data;
    const meta = campaigns;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [categoryId, setCategoryId] = useState(filters?.category_id ?? '');

    const navigateWithFilters = (overrides: Record<string, unknown> = {}) => {
        const params: Record<string, unknown> = {
            search: search || undefined,
            category_id: categoryId || undefined,
            is_active: true,
            ...overrides,
        };
        // Clean undefined values
        Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
        router.get('/donasi', params as Record<string, string>, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigateWithFilters({ page: 1 });
    };

    const handleCategoryChange = (catId: number | string) => {
        const newCatId = catId === categoryId ? '' : String(catId);
        setCategoryId(newCatId);
        router.get('/donasi', {
            search: search || undefined,
            category_id: newCatId || undefined,
            is_active: 'true',
            page: '1',
        } as Record<string, string>, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        navigateWithFilters({ page });
    };


    return (
        <MainLayout>
            {/* ===== MOBILE HEADER ===== */}
            <div className="md:hidden bg-gradient-to-br from-[#00cacd] via-[#00b8bb] to-[#008f92] px-4 pt-10 pb-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🕌</span>
                    <h1 className="text-white font-bold text-lg tracking-wide">Donasi Al Khidmah</h1>
                </div>

                {/* busi Card */}
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[#e0fafa] text-xs mb-1">Total Kontribusi Anda</p>
                        <p className="text-white text-2xl font-bold">
                            {user ? `Rp ${fmt(totalKontribusi)}` : 'Rp 0'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {/* History quick action */}
                        <Link href={user ? '/my-donations' : '/login'}
                            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </Link>
                        {/* Profile quick action */}
                        {/* <Link href={user ? '/my-donations' : '/login'}
                            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </Link> */}
                    </div>
                </div>
            </div>

            {/* ===== MOBILE SEARCH ===== */}
            <div className="md:hidden px-4 py-3 bg-gray-50">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari program..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00cacd]/40 shadow-sm"
                    />
                    <button type="submit"
                        className="bg-[#00cacd] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#00b8bb] transition shadow-sm">
                        Cari
                    </button>
                </form>
            </div>

            {/* ===== PROGRAM PILIHAN (Categories) ===== */}
            <section className="py-4 md:py-6 md:px-4 md:max-w-5xl md:mx-auto">
                <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-0">
                    <h2 className="text-base md:text-xl font-bold text-gray-800">Program Pilihan</h2>
                </div>
                {/* Mobile: horizontal scroll | Desktop: grid */}
                <div className="flex gap-3 overflow-x-auto pb-2 px-4 md:hidden" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                    {/* Semua */}
                    <button
                        onClick={() => handleCategoryChange('')}
                        className={`flex-none flex flex-col items-center gap-2 py-3 px-3 rounded-2xl border-2 transition-all w-[72px] ${
                            !categoryId
                                ? 'bg-[#00cacd] border-[#00cacd] shadow-md shadow-[#00cacd]/30'
                                : 'bg-white border-gray-100 shadow-sm'
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                            !categoryId ? 'bg-white/25' : 'bg-amber-100'
                        }`}>🌟</div>
                        <span className={`text-[10px] font-semibold text-center leading-tight ${
                            !categoryId ? 'text-white' : 'text-gray-600'
                        }`}>Semua</span>
                    </button>
                    {categories.map((cat) => {
                        const cfg = CATEGORY_ICONS[cat.name] ?? { emoji: '❤️', bg: 'bg-pink-100', color: 'text-pink-600' };
                        const active = String(categoryId) === String(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`flex-none flex flex-col items-center gap-2 py-3 px-3 rounded-2xl border-2 transition-all w-[72px] ${
                                    active
                                        ? 'bg-[#00cacd] border-[#00cacd] shadow-md shadow-[#00cacd]/30'
                                        : 'bg-white border-gray-100 shadow-sm'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                                    active ? 'bg-white/25' : cfg.bg
                                }`}>{cfg.emoji}</div>
                                <span className={`text-[10px] font-semibold text-center leading-tight ${
                                    active ? 'text-white' : 'text-gray-600'
                                }`}>{cat.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Desktop: grid */}
                <div className="hidden md:grid md:grid-cols-5 lg:grid-cols-7 gap-3">
                    <button
                        onClick={() => handleCategoryChange('')}
                        className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all ${
                            !categoryId
                                ? 'bg-[#00cacd] border-[#00cacd] shadow-md shadow-[#00cacd]/30'
                                : 'bg-white border-gray-100 hover:border-[#00cacd]/40 hover:shadow-md shadow-sm'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            !categoryId ? 'bg-white/25' : 'bg-amber-100'
                        }`}>🌟</div>
                        <span className={`text-[11px] font-semibold text-center leading-tight ${
                            !categoryId ? 'text-white' : 'text-gray-600'
                        }`}>Semua</span>
                    </button>
                    {categories.map((cat) => {
                        const cfg = CATEGORY_ICONS[cat.name] ?? { emoji: '❤️', bg: 'bg-pink-100', color: 'text-pink-600' };
                        const active = String(categoryId) === String(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all ${
                                    active
                                        ? 'bg-[#00cacd] border-[#00cacd] shadow-md shadow-[#00cacd]/30'
                                        : 'bg-white border-gray-100 hover:border-[#00cacd]/40 hover:shadow-md shadow-sm'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                                    active ? 'bg-white/25' : cfg.bg
                                }`}>{cfg.emoji}</div>
                                <span className={`text-[11px] font-semibold text-center leading-tight ${
                                    active ? 'text-white' : 'text-gray-600'
                                }`}>{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ===== CAMPAIGNS ===== */}
            <section className="px-4 md:max-w-5xl md:mx-auto pb-8">
                <div className="flex items-center justify-between mb-3 md:mb-5">
                    <h2 className="text-base md:text-xl font-bold text-gray-800">
                        {categoryId
                            ? categories.find(c => String(c.id) === String(categoryId))?.name ?? 'Campaign'
                            : 'Campaign Terbaru'}
                    </h2>
                    {meta && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                            {meta.total} program
                        </span>
                    )}
                </div>

                {campaignList.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="text-5xl mb-3">🔍</div>
                        <p className="text-gray-500 font-medium">Tidak ada program ditemukan.</p>
                        <button
                            onClick={() => { setSearch(''); setCategoryId(''); navigateWithFilters({ search: undefined, category_id: undefined, page: 1 }); }}
                            className="mt-3 text-[#00cacd] text-sm underline"
                        >
                            Reset filter
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mobile: vertical list | Desktop: grid */}
                        <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 md:space-y-0">
                            {campaignList.map((campaign) => (
                                <Link
                                    key={campaign.id}
                                    href={`/campaigns/${campaign.id}`}
                                    className="block hover:shadow-xl transition-all duration-300 rounded-2xl"
                                >
                                    <CampaignCard campaign={campaign} />
                                </Link>
                            ))}
                        </div>
                        <div className="mt-8">
                            <Pagination meta={meta} onPageChange={handlePageChange} />
                        </div>
                    </>
                )}
            </section>
        </MainLayout>
    );
}

