import { useState, useRef, useEffect } from 'react';
import { Bell, Search, CircleDollarSign, LogOut, User, ChevronDown } from 'lucide-react';
import { usePage, router, Link } from '@inertiajs/react';
import type { PageProps } from '@/types';

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

type Props = {
    balance: number;
    appName?: string;
};

export default function Navbar({ balance, appName = 'Al-Khidmah' }: Props) {
    const page = usePage<PageProps<{ balance: number }>>();
    const { auth } = page.props as any;
    const user = auth?.user;
    const currentPath = new URL(page.url, window.location.origin).pathname;

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        router.post('/logout');
    };

    const initials = user?.name
        ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
        : 'AK';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-outline-variant/10 bg-surface-bright/85 px-8 py-4 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">

                {/* Logo */}
                <div className="flex flex-shrink-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
                        <CircleDollarSign className="size-5 text-on-primary" />
                    </div>
                    <div>
                        <p className="font-headline text-base font-bold leading-tight text-primary">{appName}</p>
                        <p className="text-[10px] leading-tight text-on-surface-variant">Payment Point</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="hidden flex-1 md:block" style={{ maxWidth: '28rem' }}>
                    <div className="group relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="Cari layanan, transaksi..."
                            className="w-full rounded-2xl border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Nav Links */}
                <div className="hidden items-center gap-1 lg:flex">
                    <Link
                        href="/"
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${currentPath === '/' ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                        Beranda
                    </Link>
                    <Link
                        href="/history"
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${currentPath === '/history' ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                        Riwayat
                    </Link>
                    <a href="#" className="rounded-xl px-4 py-2 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-low">
                        Tagihan
                    </a>
                    <a href="#" className="rounded-xl px-4 py-2 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-low">
                        Profil
                    </a>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Balance */}
                    <div className="hidden items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-4 py-1.5 sm:flex">
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                        <span className="text-xs font-medium text-on-surface-variant">Saldo</span>
                        <span className="text-sm font-bold text-on-surface">{idr.format(balance ?? 0)}</span>
                    </div>

                    {/* Notification Bell */}
                    <button className="relative rounded-full bg-surface-container-low p-2.5 text-on-surface transition-colors hover:bg-surface-container">
                        <Bell className="size-5" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-surface-bright bg-error" />
                    </button>

                    {/* Avatar + Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-low pl-1 pr-2.5 py-1 transition hover:bg-surface-container"
                        >
                            {/* Avatar */}
                            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary-container">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-container">
                                        <span className="font-headline text-xs font-bold text-primary">{initials}</span>
                                    </div>
                                )}
                            </div>
                            <span className="hidden max-w-[100px] truncate text-xs font-semibold text-on-surface lg:block">
                                {user?.name ?? 'Pengguna'}
                            </span>
                            <ChevronDown className={`size-3.5 text-on-surface-variant transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-xl">
                                {/* User info */}
                                <div className="flex items-center gap-3 border-b border-outline-variant/10 px-4 py-4">
                                    <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary-container">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-container">
                                                <span className="font-headline text-sm font-bold text-primary">{initials}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-on-surface">{user?.name ?? 'Pengguna'}</p>
                                        <p className="truncate text-xs text-on-surface-variant">{user?.email ?? ''}</p>
                                    </div>
                                </div>

                                {/* Menu items */}
                                <div className="p-2">
                                    <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-on-surface transition hover:bg-surface-container-low">
                                        <User className="size-4 text-on-surface-variant" />
                                        <span>Profil Saya</span>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-error transition hover:bg-error-container/30"
                                    >
                                        <LogOut className="size-4" />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </nav>
    );
}
