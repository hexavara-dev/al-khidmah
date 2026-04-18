import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../Layouts/MainLayout';
import CampaignCard from '../../components/CampaignCard';
import Pagination from '../../components/Pagination';
import { campaignService } from '../../services/campaignService';
import { categoryService } from '../../services/categoryService';

const CATEGORY_ICONS = {
    'Pendidikan': '📚',
    'Kesehatan': '🏥',
    'Bencana Alam': '🌊',
    'Yatim & Dhuafa': '🤲',
    'Masjid & Pesantren': '🕌',
    'Lingkungan': '🌿',
};

export default function HomePage() {
    const [campaigns,      setCampaigns]      = useState([]);
    const [categories,     setCategories]     = useState([]);
    const [meta,           setMeta]           = useState(null);
    const [loading,        setLoading]        = useState(true);
    const [search,         setSearch]         = useState('');
    const [committedSearch, setCommittedSearch] = useState('');
    const [categoryId,     setCategoryId]     = useState('');
    const [page,           setPage]           = useState(1);

    const fetchCampaigns = async (p, cat, q) => {
        setLoading(true);
        try {
            const { data } = await campaignService.getAll({
                search:      q       || undefined,
                category_id: cat     || undefined,
                is_active:   true,
                page:        p,
            });
            setCampaigns(data.data.data);
            setMeta(data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        categoryService.getAll().then(({ data }) => setCategories(data.data));
    }, []);

    useEffect(() => {
        fetchCampaigns(page, categoryId, committedSearch);
    }, [page, categoryId, committedSearch]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCommittedSearch(search);
        setPage(1);
    };

    return (
        <MainLayout>
            {/* Hero Section - Modern Glassmorphism + Gradient */}
            <section className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-emerald-600 text-white overflow-hidden">
                {/* Background Ornament */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
                    <span className="inline-block bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-sm font-medium mb-4 shadow-lg">
                        🌙 Platform Donasi Islami Terpercaya
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Bersama Membangun<br />
                        <span className="text-blue-200">Kebaikan untuk Ummat</span>
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        Setiap donasi Anda adalah amal jariyah yang mengalir tanpa henti.
                    </p>
                    <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari campaign..."
                            className="flex-1 px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl transition-all duration-300"
                        />
                        <button
                            type="submit"
                            className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-semibold hover:bg-blue-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                            Cari
                        </button>
                    </form>
                </div>
            </section>

            {/* Stats Cards - With Hover Effects & Shadows */}
            <section className="max-w-5xl mx-auto px-4 -mt-8 mb-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Campaign Aktif', value: meta?.total ?? '...', icon: '📢' },
                        { label: 'Total Donatur',  value: '1.2K+',             icon: '👥' },
                        { label: 'Dana Tersalur',  value: 'Rp 500jt+',         icon: '💚' },
                        { label: 'Kategori',       value: categories.length || '...', icon: '🏷️' },
                    ].map((s) => (
                        <div 
                            key={s.label} 
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-default"
                        >
                            <div className="text-3xl mb-2">{s.icon}</div>
                            <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
                            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories - Interactive Chips with Shadow & Scale */}
            <section className="max-w-5xl mx-auto px-4 py-6">
                <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    Program Pilihan
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
                    <button
                        onClick={() => { setCategoryId(''); setPage(1); }}
                        className={`flex-none flex flex-col items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 ${
                            !categoryId 
                                ? 'bg-gradient-to-br from-blue-500 to-emerald-600 text-white shadow-lg' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                        }`}
                    >
                        <span className="text-2xl">🌟</span>
                        <span>Semua</span>
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => { setCategoryId(cat.id); setPage(1); }}
                            className={`flex-none flex flex-col items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 ${
                                categoryId === cat.id 
                                    ? 'bg-gradient-to-br from-blue-500 to-emerald-600 text-white shadow-lg' 
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            <span className="text-2xl">{CATEGORY_ICONS[cat.name] ?? '❤️'}</span>
                            <span className="text-center leading-tight">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Campaigns Grid */}
            <section className="max-w-5xl mx-auto px-4 pb-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                        {categoryId
                            ? categories.find(c => c.id === categoryId)?.name
                            : 'Campaign Terbaru'}
                    </h2>
                    {meta && <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{meta.total} campaign</span>}
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div 
                                key={i} 
                                className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100 shadow-md relative overflow-hidden"
                            >
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-200/50 to-transparent animate-shimmer" />
                            </div>
                        ))}
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-500 text-lg">Tidak ada campaign ditemukan.</p>
                        <button 
                            onClick={() => { setSearch(''); setCommittedSearch(''); setCategoryId(''); setPage(1); }}
                            className="mt-4 text-blue-600 underline"
                        >
                            Reset filter
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {campaigns.map((campaign) => (
                                <Link 
                                    key={campaign.id} 
                                    to={`/campaigns/${campaign.id}`} 
                                    className="block transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-2xl"
                                >
                                    <CampaignCard campaign={campaign} />
                                </Link>
                            ))}
                        </div>
                        <div className="mt-10">
                            <Pagination meta={meta} onPageChange={setPage} />
                        </div>
                    </>
                )}
            </section>

            {/* Custom Shimmer Animation (add to global CSS or use inline style) */}
            <style jsx>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
            `}</style>
        </MainLayout>
    );
}