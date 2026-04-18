import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Pagination from '../../components/Pagination';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'user' };

export default function DashboardUsersPage() {
    const [users,      setUsers]      = useState([]);
    const [meta,       setMeta]       = useState(null);
    const [page,       setPage]       = useState(1);
    const [search,     setSearch]     = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [loading,    setLoading]    = useState(true);
    const [showForm,   setShowForm]   = useState(false);
    const [form,       setForm]       = useState(EMPTY_FORM);
    const [editing,    setEditing]    = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const load = (p, s, role) => {
        setLoading(true);
        userService.getAll({
            page: p,
            per_page: 10,
            ...(s    ? { search: s } : {}),
            ...(role ? { role }      : {}),
        })
        .then(({ data }) => { setUsers(data.data.data); setMeta(data.data); })
        .finally(() => setLoading(false));
    };

    useEffect(() => { load(page, search, filterRole); }, [page, search, filterRole]);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const openEdit = (u) => {
        setEditing(u);
        setForm({ name: u.name, email: u.email, password: '', role: u.role });
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...form };
            if (editing && !payload.password) delete payload.password;
            if (editing) {
                await userService.update(editing.id, payload);
                toast.success('User berhasil diperbarui!');
            } else {
                await userService.create(payload);
                toast.success('User berhasil ditambahkan!');
            }
            setShowForm(false);
            load();
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Gagal menyimpan user.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus user ini?')) return;
        try {
            await userService.delete(id);
            toast.success('User berhasil dihapus.');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Gagal menghapus.');
        }
    };

    const LoadingSkeleton = () => (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-gray-100 animate-pulse">
                    {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manajemen User</h2>
                    <p className="text-sm text-gray-500 mt-1">Kelola semua pengguna terdaftar</p>
                </div>
               <button
                onClick={openCreate}
                className="bg-blue-600 text-white px-5 py-1 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 self-start"
            >
                <span className="text-lg">+</span> Tambah User
            </button>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {editing ? '✏️ Edit User' : '👤 Tambah User Baru'}
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                    placeholder="Nama lengkap user"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                    placeholder="email@contoh.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {editing && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                                    {!editing && <span className="text-red-500"> *</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                    placeholder="Min. 8 karakter"
                                    required={!editing}
                                    minLength={editing ? undefined : 8}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                                >
                                    {submitting ? 'Menyimpan...' : (editing ? 'Update User' : 'Simpan User')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bergabung</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <LoadingSkeleton />
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400">
                                        <p className="text-sm">Belum ada user terdaftar</p>
                                    </td>
                                </tr>
                            ) : users.map((u, i) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-400 text-xs">
                                        {(meta.current_page - 1) * meta.per_page + i + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-800">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                            u.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">
                                        {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEdit(u)}
                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition"
                                            >
                                                ✏️ Edit
                                            </button>
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-50 transition"
                                                >
                                                    🗑️ Hapus
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {meta && users.length > 0 && (
                <div className="mt-6">
                    <Pagination meta={meta} onPageChange={setPage} />
                </div>
            )}
        </DashboardLayout>
    );
}
