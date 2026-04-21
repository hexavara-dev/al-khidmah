import { Link, usePage } from '@inertiajs/react';
import { Home, ScrollText, Banknote, CircleUser, HandCoins } from 'lucide-react';

type NavItem = {
    key: string;
    label: string;
    icon: typeof Home;
    href: string;
    matchPaths?: string[];
};

const navItems: NavItem[] = [
    { key: 'beranda',  label: 'Beranda', icon: Home,       href: '/',       matchPaths: ['/'] },
    { key: 'donasi',   label: 'Donasi',  icon: HandCoins,  href: '/donasi', matchPaths: ['/donasi', '/campaigns'] },
    { key: 'riwayat',  label: 'Riwayat', icon: ScrollText, href: '/history', matchPaths: ['/history', '/my-donations'] },
    { key: 'tagihan',  label: 'Tagihan', icon: Banknote,   href: '#'        },
    { key: 'profil',   label: 'Profil',  icon: CircleUser, href: '#'        },
];

type Props = {
    active?: string;
};

export default function BottomNav({ active }: Props) {
    const { url } = usePage();
    const resolvedActive = active ?? (
        navItems.find(item =>
            item.matchPaths?.some(p => p === '/' ? url === '/' : url.startsWith(p))
        )?.key ?? 'beranda'
    );
    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="flex justify-center pointer-events-auto">
                <nav className="inline-flex items-center gap-0.5 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest/90 px-2 py-3 shadow-xl shadow-on-surface/10 backdrop-blur-xl">
                    {navItems.map(({ key, label, icon: Icon, href }) => {
                        const isActive = resolvedActive === key;
                        const isDonasi = key === 'donasi';
                        const activeColor = isDonasi ? '#00cacd' : undefined;
                        const activeBg = isDonasi ? '#00cacd1a' : undefined;
                        return (
                            <Link
                                key={key}
                                href={href}
                                className="flex flex-col items-center gap-1 px-1.5"
                            >
                                <div
                                    className={`flex items-center justify-center rounded-2xl px-4 py-1.5 transition-all duration-200 ${
                                        isActive && !isDonasi ? 'bg-primary-container' : ''
                                    }`}
                                    style={isActive && isDonasi ? { backgroundColor: activeBg } : undefined}
                                >
                                    <Icon
                                        className={`size-6 transition-colors duration-200 ${
                                            isActive && !isDonasi ? 'text-primary' : isActive ? '' : 'text-outline'
                                        }`}
                                        style={isActive && isDonasi ? { color: activeColor } : undefined}
                                        strokeWidth={isActive ? 2.5 : 1.5}
                                    />
                                </div>
                                <span
                                    className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                                        isActive && !isDonasi ? 'text-primary' : isActive ? '' : 'text-outline'
                                    }`}
                                    style={isActive && isDonasi ? { color: activeColor } : undefined}
                                >
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

        </div>
    );
}
