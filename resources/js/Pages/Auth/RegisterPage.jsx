import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
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

const PW_RULES = [
    { label: 'Minimal 8 karakter',           test: (p) => p.length >= 8 },
    { label: 'Mengandung huruf kapital (A-Z)',test: (p) => /[A-Z]/.test(p) },
    { label: 'Mengandung angka (0-9)',        test: (p) => /[0-9]/.test(p) },
    { label: 'Mengandung simbol (!@#$...)',   test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
    const [form, setForm]               = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [loading, setLoading]         = useState(false);
    const [errors, setErrors]           = useState({});
    const [registered, setRegistered]   = useState(false);
    const [showPw, setShowPw]           = useState(false);
    const [showPwConf, setShowPwConf]   = useState(false);
    const [pwFocused, setPwFocused]     = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim())
            errs.name = 'Nama lengkap wajib diisi.';

        if (!form.email)
            errs.email = 'Email wajib diisi.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = 'Format email tidak valid.';

        const pwOk = PW_RULES.every(r => r.test(form.password));
        if (!form.password)
            errs.password = 'Password wajib diisi.';
        else if (!pwOk)
            errs.password = 'Password belum memenuhi semua persyaratan.';

        if (!form.password_confirmation)
            errs.password_confirmation = 'Konfirmasi password wajib diisi.';
        else if (form.password !== form.password_confirmation)
            errs.password_confirmation = 'Konfirmasi password tidak cocok.';

        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            await authService.register(form);
            setRegistered(true);
        } catch (err) {
            const errData = err.response?.data;
            if (errData?.errors) setErrors(errData.errors);
            else toast.error(errData?.message ?? 'Registrasi gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (registered) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-emerald-600 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <span className="text-5xl">🕌</span>
                        <p className="text-white font-bold text-xl mt-2">Al-Khidmah</p>
                    </div>
                    <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-5xl">✅</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Akun Berhasil Dibuat!</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Selamat bergabung di Al-Khidmah. Silakan masuk menggunakan akun yang baru Anda buat.
                        </p>
                        <Link
                            to="/login"
                            className="block w-full bg-gradient-to-r from-blue-500 to-emerald-600 text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition shadow-md"
                        >
                            Masuk Sekarang
                        </Link>
                        <Link to="/" className="block text-sm text-gray-400 mt-4 hover:text-gray-600">
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const pwStrength = PW_RULES.filter(r => r.test(form.password)).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-emerald-600 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex flex-col items-center gap-2">
                        <span className="text-5xl">🕌</span>
                        <span className="text-white font-bold text-xl tracking-wide">Al-Khidmah</span>
                        <span className="text-blue-200 text-sm">Platform Donasi Islami</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Buat Akun Baru</h2>
                    <p className="text-gray-400 text-sm mb-6">Bergabunglah dan mulai berdonasi untuk kebaikan.</p>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Nama Anda"
                                className={`w-full border-2 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1.5">⚠ {Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>}
                        </div>

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
                            {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠ {Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    onFocus={() => setPwFocused(true)}
                                    onBlur={() => setPwFocused(false)}
                                    placeholder="••••••••"
                                    className={`w-full border-2 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                    tabIndex={-1}
                                >
                                    <EyeIcon open={showPw} />
                                </button>
                            </div>

                            {/* Password strength bar */}
                            {(pwFocused || form.password) && (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex gap-1">
                                        {[0,1,2,3].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                                i < pwStrength
                                                    ? pwStrength <= 1 ? 'bg-red-400'
                                                    : pwStrength === 2 ? 'bg-amber-400'
                                                    : pwStrength === 3 ? 'bg-blue-400'
                                                    : 'bg-emerald-500'
                                                    : 'bg-gray-200'
                                            }`} />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                        {PW_RULES.map(r => (
                                            <p key={r.label} className={`text-xs flex items-center gap-1 ${r.test(form.password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                <span>{r.test(form.password) ? '✓' : '○'}</span>
                                                {r.label}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
                            <div className="relative">
                                <input
                                    type={showPwConf ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={form.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full border-2 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 transition ${errors.password_confirmation ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwConf(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                    tabIndex={-1}
                                >
                                    <EyeIcon open={showPwConf} />
                                </button>
                            </div>
                            {form.password_confirmation && form.password !== form.password_confirmation && (
                                <p className="text-red-500 text-xs mt-1.5">⚠ Password tidak cocok.</p>
                            )}
                            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1.5">⚠ {Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-emerald-600 text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition disabled:opacity-60 shadow-md mt-2"
                        >
                            {loading ? 'Memproses...' : 'Daftar Sekarang'}
                        </button>
                    </form>

                    <p className="text-sm text-center text-gray-400 mt-5">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-blue-600 font-semibold hover:underline">Masuk di sini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}



