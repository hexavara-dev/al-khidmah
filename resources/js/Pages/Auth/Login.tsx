import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Heart, ShoppingBag, Zap } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const services = [
    { icon: Zap, label: 'PPOB', desc: 'Pulsa, Token PLN, Air & Internet' },
    { icon: Heart, label: 'Donasi', desc: 'Zakat, Infaq, Sedekah & Wakaf' },
    { icon: ShoppingBag, label: 'Toko', desc: 'Produk islami & kebutuhan harian' },
];

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="min-h-screen flex bg-white">
            <Head title="Admin — Masuk" />

            {/* ── Left: Islamic branding panel ── */}
            <div
                className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden"
                style={{ background: 'linear-gradient(155deg, #0c1f5e 0%, #1044b0 55%, #1a6fd4 100%)' }}
            >
                {/* Islamic geometric tile pattern */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        <pattern id="islamic-geo" width="80" height="80" patternUnits="userSpaceOnUse">
                            {/* Outer octagon */}
                            <polygon
                                points="24,0 56,0 80,24 80,56 56,80 24,80 0,56 0,24"
                                fill="none"
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="0.8"
                            />
                            {/* 8-pointed star */}
                            <polygon
                                points="40,14 44.5,29 58,23 52,36 68,40 52,44 58,57 44.5,51 40,66 35.5,51 22,57 28,44 12,40 28,36 22,23 35.5,29"
                                fill="none"
                                stroke="rgba(255,255,255,0.07)"
                                strokeWidth="0.7"
                            />
                            {/* Inner octagon */}
                            <polygon
                                points="33,29 47,29 54,36 54,47 47,54 33,54 26,47 26,36"
                                fill="none"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="0.6"
                            />
                            {/* Center dot */}
                            <circle cx="40" cy="40" r="2.5" fill="rgba(255,255,255,0.06)" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#islamic-geo)" />
                </svg>

                {/* Ambient glows */}
                <div
                    className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(96,165,250,0.2) 0%, transparent 65%)' }}
                />
                <div
                    className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(30,64,175,0.4) 0%, transparent 65%)' }}
                />

                <div className="relative z-10 flex flex-col justify-between h-full p-14">
                    {/* Logo + Bismillah */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm shrink-0">
                                {/* Crescent moon icon */}
                                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                                    <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.91-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-bold text-[15px] leading-none tracking-tight">Al-Khidmah</p>
                                <p className="text-blue-200/70 text-[11px] mt-0.5 tracking-wide">Platform Layanan Islami</p>
                            </div>
                        </div>

                        {/* Bismillah */}
                        <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm inline-block">
                            <p
                                className="text-white/80 text-lg font-light leading-relaxed tracking-wider"
                                style={{ fontFamily: 'serif', direction: 'rtl' }}
                            >
                                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                            </p>
                        </div>
                    </div>

                    {/* Hero copy */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse" />
                                Admin Panel
                            </span>
                            <h1 className="text-[2.5rem] font-extrabold leading-[1.15] text-white tracking-tight">
                                Satu platform<br />untuk semua<br />
                                <span className="text-blue-200">layanan umat.</span>
                            </h1>
                            <p className="text-blue-100/60 text-[14px] leading-relaxed max-w-[300px]">
                                Kelola PPOB, donasi, dan toko Al-Khidmah dari satu dasbor terintegrasi secara real-time.
                            </p>
                        </div>

                        {/* 3 Service cards */}
                        <div className="space-y-2.5">
                            {services.map(({ icon: Icon, label, desc }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-sm"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-[13px] leading-none">{label}</p>
                                        <p className="text-blue-200/60 text-[11px] mt-1">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-blue-200/30 text-[12px]">
                        &copy; {new Date().getFullYear()} Al-Khidmah. All rights reserved.
                    </p>
                </div>
            </div>

            {/* ── Right: Form panel ── */}
            <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 sm:px-16">
                {/* Mobile logo */}
                <div className="mb-10 flex flex-col items-center gap-2 lg:hidden">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.91-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                        </svg>
                    </div>
                    <span className="font-bold text-slate-900">Al-Khidmah</span>
                </div>

                <div className="w-full max-w-[360px]">
                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-[1.75rem] font-bold text-slate-900 tracking-tight leading-none">Masuk</h2>
                        <p className="mt-2 text-[14px] text-slate-500">
                            Gunakan akun admin Anda untuk melanjutkan
                        </p>
                    </div>

                    {status && (
                        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-[13px] font-medium text-slate-700">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
                                placeholder="admin@example.com"
                                onChange={(e) => setData('email', e.target.value)}
                                className={[
                                    'h-10 rounded-lg text-[14px] text-slate-900 placeholder:text-slate-400',
                                    'border bg-slate-50/80 transition-all duration-150',
                                    errors.email
                                        ? 'border-red-400 ring-2 ring-red-400/20'
                                        : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15',
                                ].join(' ')}
                            />
                            {errors.email && <p className="text-[12px] text-red-500">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-[13px] font-medium text-slate-700">
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-[12px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        Lupa password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={[
                                        'h-10 rounded-lg pr-10 text-[14px] text-slate-900 placeholder:text-slate-400',
                                        'border bg-slate-50/80 transition-all duration-150',
                                        errors.password
                                            ? 'border-red-400 ring-2 ring-red-400/20'
                                            : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15',
                                    ].join(' ')}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-[15px] w-[15px]" /> : <Eye className="h-[15px] w-[15px]" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[12px] text-red-500">{errors.password}</p>}
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2.5 pt-0.5">
                            <input
                                id="remember"
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked as false)}
                                className="h-[15px] w-[15px] rounded border-slate-300 accent-blue-600 cursor-pointer"
                            />
                            <Label htmlFor="remember" className="cursor-pointer select-none text-[13px] font-normal text-slate-600">
                                Ingat saya selama 30 hari
                            </Label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-1 w-full h-10 rounded-lg bg-blue-600 text-[13px] font-semibold text-white tracking-wide shadow-sm shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : 'Masuk ke Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

