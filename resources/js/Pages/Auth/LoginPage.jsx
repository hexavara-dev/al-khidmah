import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function EyeIcon({ open }) {
    return open ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );
}

export default function LoginPage() {
    const { login } = useAuth();
    const navigate  = useNavigate();
    const [form, setForm]           = useState({ email: '', password: '' });
    const [loading, setLoading]     = useState(false);
    const [errors, setErrors]       = useState({});
    const [showPassword, setShowPw] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.email) {
            errs.email = 'Email wajib diisi.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Format email tidak valid.';
        }
        if (!form.password) {
            errs.password = 'Password wajib diisi.';
        } else if (form.password.length < 8) {
            errs.password = 'Password minimal 8 karakter.';
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            const user = await login(form);
            toast.success('Login berhasil!');
            navigate(user.role === 'admin' ? '/dashboard' : '/donasi');
        } catch (err) {
            const errData = err.response?.data;
            if (errData?.errors) setErrors(errData.errors);
            else toast.error(errData?.message ?? 'Login gagal. Periksa email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-emerald-600 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex flex-col items-center gap-2">
                        <span className="text-5xl">🕌</span>
                        <span className="text-white font-bold text-xl tracking-wide">Al-Khidmah</span>
                        <span className="text-blue-200 text-sm">Platform Donasi Islami</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Selamat Datang</h2>
                    <p className="text-gray-400 text-sm mb-6">Masuk ke akun Anda untuk melanjutkan.</p>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="email@contoh.com"
                                className={`w-full border-2 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full border-2 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                    tabIndex={-1}
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-emerald-600 text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition disabled:opacity-60 shadow-md mt-2"
                        >
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>

                    <p className="text-sm text-center text-gray-400 mt-5">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-blue-600 font-semibold hover:underline">Daftar sekarang</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
