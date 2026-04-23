import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import type { PageProps } from '../types';

export default function Navbar() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;
    const currentUrl = usePage().url;
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        router.post('/logout', {}, {
            onSuccess: () => {
                toast.success('Berhasil logout');
            },
        });
        setMenuOpen(false);
    };

    const isActive = (href: string) => currentUrl === href || currentUrl.startsWith(href + '/');

    const navLink = (href: string, label: string) => (
        <Link
            href={href}
            onClick={() => setMenuOpen(false)}
            className={`relative text-sm font-medium transition pb-1 ${
                isActive(href)
                    ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:rounded-full'
                    : 'text-[#c0f0f0] hover:text-white'
            }`}
        >
            {label}
        </Link>
    );

    return (
        <nav className="bg-gradient-to-r from-[#006669] via-[#008f92] to-[#00cacd] text-white shadow-lg sticky top-0 z-40">
            {/* Top accent line */}
            <div className="h-1 bg-gradient-to-r from-[#1d6e6a] via-[#258d88] to-[#37b5af]" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/donasi" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center transition">
                            <img src="/images/assets/eKhidmah_logo.png" alt="eKhidmah" className="w-9 h-9 object-contain" />
                        </div>
                        <div className="leading-none">
                            <span className="font-bold text-base tracking-wide block">eKhidmah</span>
                            <span className="text-[10px] text-[#c0f0f0] tracking-wider block">Platform Donasi</span>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLink('/donasi', 'Beranda')}
                        {user ? (
                            <>
                                {/* {user.role === 'admin' && navLink('/admin/dashboard', 'Dashboard')} */}
                                {navLink('/my-donations', 'Donasiku')}
                            </>
                        ) : (
                            navLink('/login', 'Masuk')
                        )}
                    </div>

                    {/* Desktop right actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 border border-white/20">
                                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="text-sm text-[#e0fafa] font-medium">{user.name.split(' ')[0]}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-white text-[#00838a] px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-[#e0fafa] active:scale-95 transition shadow-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/register"
                                className="bg-white text-[#00838a] px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-[#e0fafa] active:scale-95 transition shadow-sm"
                            >
                                Daftar
                            </Link>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-xl hover:bg-white/10 transition"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className={`w-5 h-0.5 bg-white mb-1.5 transition-all origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <div className={`w-5 h-0.5 bg-white mb-1.5 transition-all ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                        <div className={`w-5 h-0.5 bg-white transition-all origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-white/20 bg-[#007275]/95 backdrop-blur-sm">
                    <div className="max-w-5xl mx-auto px-4 py-4 space-y-1">
                        <Link href="/donasi" onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/donasi') ? 'bg-white/20 text-white' : 'text-[#c0f0f0] hover:bg-white/10 hover:text-white'}`}>
                            🏠 Beranda
                        </Link>
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[#c0f0f0] hover:bg-white/10 hover:text-white transition">
                                        ⚙️ Dashboard Admin
                                    </Link>
                                )}
                                <Link href="/my-donations" onClick={() => setMenuOpen(false)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive('/my-donations') ? 'bg-white/20 text-white' : 'text-[#c0f0f0] hover:bg-white/10 hover:text-white'}`}>
                                    📋 Donasiku
                                </Link>
                                <div className="border-t border-white/10 my-2" />
                                <div className="px-3 py-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-sm font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-semibold">{user.name}</p>
                                            <p className="text-[#a8ecee] text-xs">{user.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={handleLogout}
                                        className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[#c0f0f0] hover:bg-white/10 hover:text-white transition">
                                    🔑 Masuk
                                </Link>
                                <Link href="/register" onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 mx-3 mt-1 py-2.5 rounded-xl text-sm font-semibold bg-white text-[#00838a] hover:bg-[#e0fafa] transition">
                                    Daftar Sekarang
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
