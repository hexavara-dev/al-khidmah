import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '../../components/Pagination';
import { campaignService } from '../../services/campaignService';
import { categoryService } from '../../services/categoryService';
import { reportService } from '../../services/reportService';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
    title: '', description: '', target_amount: '', category_id: '', deadline: '', is_active: true,
};

export default function DashboardCampaignsPage() {
    const [campaigns,   setCampaigns]   = useState([]);
    const [categories,  setCategories]  = useState([]);
    const [meta,        setMeta]        = useState(null);
    const [page,        setPage]        = useState(1);
    const [search,      setSearch]      = useState('');
    const [filterCat,   setFilterCat]   = useState('');
    const [loading,     setLoading]     = useState(true);
    const [showForm,    setShowForm]    = useState(false);
    const [form,        setForm]        = useState(EMPTY_FORM);
    const [editing,     setEditing]     = useState(null);
    const [submitting,  setSubmitting]  = useState(false);
    const [imageFile,   setImageFile]   = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const fileRef = useRef();

    const load = (p, s, cat) => {
        setLoading(true);
        campaignService.getAll({
            page: p,
            per_page: 10,
            ...(s   ? { search: s }       : {}),
            ...(cat ? { category_id: cat } : {}),
        })
        .then(({ data }) => { setCampaigns(data.data.data); setMeta(data.data); })
        .finally(() => setLoading(false));
    };

    useEffect(() => { load(page, search, filterCat); }, [page, search, filterCat]);
    useEffect(() => { categoryService.getAll().then(({ data }) => setCategories(data.data)); }, []);

    const openCreate = () => { 
        setEditing(null); 
        setForm(EMPTY_FORM); 
        setImageFile(null);
        setImagePreview(null);
        setShowForm(true); 
    };
    
    const openEdit = (c) => {
        setEditing(c);
        setForm({
            title:         c.title,
            description:   c.description,
            target_amount: c.target_amount,
            category_id:   c.category_id,
            deadline:      c.deadline?.split('T')[0] ?? c.deadline,
            is_active:     c.is_active,
        });
        setImageFile(null);
        setImagePreview(c.image_url ? c.image_url : null);
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (k === 'is_active') {
                    fd.append(k, v ? 1 : 0);
                } else {
                    fd.append(k, v);
                }
            });
            if (imageFile) fd.append('image', imageFile);
            if (editing) {
                fd.append('_method', 'PUT');
                await campaignService.update(editing.id, fd);
                toast.success('Campaign berhasil diperbarui!');
            } else {
                await campaignService.create(fd);
                toast.success('Campaign berhasil ditambahkan!');
            }
            setShowForm(false);
            load(page, search, filterCat);
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Gagal menyimpan campaign.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus campaign ini? Tindakan ini tidak dapat dibatalkan.')) return;
        try {
            await campaignService.delete(id);
            toast.success('Campaign berhasil dihapus.');
            load(page, search, filterCat);
        } catch {
            toast.error('Gagal menghapus campaign.');
        }
    };

    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            await reportService.downloadCampaignPdf(filterCat ? { category_id: filterCat } : {});
            toast.success('Laporan PDF berhasil diunduh.');
        } catch {
            toast.error('Gagal mengunduh laporan.');
        } finally {
            setDownloading(false);
        }
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-gray-100 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                </tr>
            ))}
        </>
    );

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manajemen Campaign</h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola semua campaign donasi Anda</p>
                </div>
                <div className="flex gap-2 self-start">
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
                   <button
    onClick={openCreate}
    className="bg-blue-600 text-white px-5 py-1 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
>
    <span className="text-lg">+</span> Tambah Campaign
</button>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {editing ? '✏️ Edit Campaign' : '✨ Tambah Campaign Baru'}
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Judul Campaign <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Contoh: Bantu Anak Yatim"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category_id"
                                        value={form.category_id}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Target Donasi (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="target_amount"
                                        value={form.target_amount}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="1000000"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tenggat Waktu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={form.deadline}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ceritakan campaign ini secara detail..."
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Campaign</label>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {imagePreview && (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg shadow" />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); setImagePreview(null); if(fileRef.current) fileRef.current.value = ''; }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG. Maksimal 2MB</p>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    id="is_active"
                                    checked={form.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Aktifkan Campaign</label>
                                <span className="text-xs text-gray-400">(Campaign aktif akan ditampilkan ke publik)</span>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                               <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                                >
                                    {submitting ? 'Menyimpan...' : (editing ? 'Update Campaign' : 'Simpan Campaign')}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-all shadow-md"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search / Filter toolbar */}
                <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">🔍</span>
                        <input
                            type="text"
                            placeholder="Cari judul campaign..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterCat}
                        onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px] bg-white"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Judul</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategori</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Target</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Terkumpul</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <LoadingSkeleton />
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <div className="text-gray-400">
                                            <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm">Belum ada campaign</p>
                                            <button onClick={openCreate} className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                + Buat campaign pertama
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800 max-w-[200px] truncate">{c.title}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {c.category?.name ?? 'Umum'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-700">
                                            Rp {Number(c.target_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-blue-700">
                                                    Rp {Number(c.collected_amount).toLocaleString('id-ID')}
                                                </span>
                                                <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                                    <div 
                                                        className="bg-blue-500 h-1.5 rounded-full" 
                                                        style={{ width: `${Math.min((c.collected_amount / c.target_amount) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                c.is_active 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.is_active ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                                                {c.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(c)}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-50 transition"
                                                >
                                                    🗑️ Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {meta && campaigns.length > 0 && (
                <div className="mt-6">
                    <Pagination meta={meta} onPageChange={setPage} />
                </div>
            )}
        </AdminLayout>
    );
}