import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();
    const location         = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Berhasil logout');
        navigate('/login');
        setMenuOpen(false);
    };

    const navLink = (to, label) => (
        <Link
            to={to}
            onClick={() => setMenuOpen(false)}
            className={`text-sm font-medium transition ${
                location.pathname === to ? 'text-white' : 'text-blue-100 hover:text-white'
            }`}
        >
            {label}
        </Link>
    );

    return (
        <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl">🕌</span>
                        <span className="font-bold text-lg tracking-wide">Al-Khidmah</span>
                    </Link>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLink('/donasi', 'Beranda')}
                        {user ? (
                            <>
                                {user.role === 'admin' && navLink('/dashboard', 'Dashboard')}
                                {navLink('/my-donations', 'Donasiku')}
                                <span className="text-blue-200 text-sm">Hi, {user.name.split(' ')[0]}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-white text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-50 transition"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                {navLink('/login', 'Masuk')}
                                <Link
                                    to="/register"
                                    className="bg-white text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-50 transition"
                                >
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-blue-700 transition"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                        <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
                        <div className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden pb-4 space-y-3 border-t border-blue-700/50 pt-4">
                        <Link to="/" onClick={() => setMenuOpen(false)} className="block text-sm text-blue-100 hover:text-white">Beranda</Link>
                        {user ? (
                            <>
                                {user.role === 'admin' && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm text-blue-100 hover:text-white">Dashboard</Link>}
                                <Link to="/my-donations" onClick={() => setMenuOpen(false)} className="block text-sm text-blue-100 hover:text-white">Donasiku</Link>
                                <button onClick={handleLogout} className="block w-full text-left text-sm text-blue-100 hover:text-white">
                                    Logout ({user.name.split(' ')[0]})
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm text-blue-100 hover:text-white">Masuk</Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-sm text-blue-100 hover:text-white">Daftar</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
