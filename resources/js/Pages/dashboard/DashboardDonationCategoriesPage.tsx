import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '../../components/Pagination';
import { donationCategoryService } from '../../services/donationCategoryService';
import toast from 'react-hot-toast';

export default function DashboardDonationCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [form, setForm]             = useState({ name: '' });
    const [editing, setEditing]       = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const load = () => {
        setLoading(true);
        donationCategoryService.getAll()
            .then(({ data }) => setCategories(data.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await donationCategoryService.update(editing.id, form);
                toast.success('Kategori diperbarui.');
            } else {
                await donationCategoryService.create(form);
                toast.success('Kategori ditambahkan.');
            }
            setForm({ name: '' });
            setEditing(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Gagal menyimpan.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (cat) => {
        setEditing(cat);
        setForm({ name: cat.name });
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus kategori ini?')) return;
        try {
            await donationCategoryService.destroy(id);
            toast.success('Kategori dihapus.');
            load();
        } catch {
            toast.error('Gagal menghapus.');
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manajemen Kategori</h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola kategori campaign donasi</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Form Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">
                            {editing ? '✏️ Edit Kategori' : '✨ Tambah Kategori'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Kategori <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Misal: Pendidikan"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-600 text-white text-xs font-semibold py-4 rounded-xl text-center"
                                >
                                    {submitting ? 'Menyimpan...' : editing ? 'Update' : 'Tambah'}
                                </button>
                                {editing && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditing(null); setForm({ name: '' }); }}
                                        className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Table Card */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jml Campaign</th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        [...Array(4)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                {[...Array(4)].map((__, j) => (
                                                    <td key={j} className="px-5 py-4">
                                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                                                Belum ada kategori
                                            </td>
                                        </tr>
                                    ) : categories.map((cat, i) => (
                                        <tr key={cat.id} className={`hover:bg-gray-50 transition-colors ${editing?.id === cat.id ? 'bg-yellow-50' : ''}`}>
                                            <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                                            <td className="px-5 py-3 font-medium text-gray-800">{cat.name}</td>
                                            <td className="px-5 py-3">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    {cat.campaigns_count ?? 0} campaign
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(cat)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-50 transition"
                                                    >
                                                        🗑️ Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
