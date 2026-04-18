import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/dashboard',            label: '📊 Dashboard' },
    { to: '/dashboard/campaigns',  label: '📢 Campaign' },
    { to: '/dashboard/categories', label: '🏷️ Kategori' },
    { to: '/dashboard/donations',  label: '💳 Donasi' },
    { to: '/dashboard/users',      label: '👥 Users' },
];

export default function DashboardLayout({ children }) {
    const { logout } = useAuth();
    const navigate   = useNavigate();
    const location   = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Berhasil logout');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col
                transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-blue-700/50">
                    <Link to="/donasi" className="flex items-center gap-2">
                        <span className="text-2xl">🕌</span>
                        <div>
                            <p className="font-bold text-white">Al-Khidmah</p>
                            <p className="text-blue-300 text-xs">Admin Panel</p>
                        </div>
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center px-4 py-2.5 rounded-xl text-sm transition ${
                                location.pathname === item.to
                                    ? 'bg-white/20 font-semibold text-white'
                                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-blue-700/50 space-y-1">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-blue-200 hover:bg-white/10 hover:text-white transition"
                    >
                        🚪 Logout
                    </button>
                    <Link to="/donasi" className="flex items-center gap-2 px-4 py-2 text-xs text-blue-400 hover:text-blue-200 transition">
                        ← Kembali ke Website
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
                        aria-label="Open sidebar"
                    >
                        ☰
                    </button>
                    <h1 className="font-semibold text-gray-700 text-sm flex-1">
                        {navItems.find(n => n.to === location.pathname)?.label ?? 'Dashboard'}
                    </h1>
                    <Link to="/donasi" className="text-xs text-gray-400 hover:text-gray-600 hidden lg:block">← Website</Link>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
