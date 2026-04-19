import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '../types';

const HomeIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

const HistoryIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function BottomNavbar() {
    const { url, props } = usePage<PageProps>();
    const user = props.auth?.user;

    const items = [
        {
            href: '/donasi',
            label: 'Home',
            Icon: HomeIcon,
            isActive: () => url === '/donasi' || url.startsWith('/campaigns'),
        },
        {
            href: user ? '/my-donations' : '/login',
            label: 'History',
            Icon: HistoryIcon,
            isActive: () => url === '/my-donations',
        },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-center h-16">
                {items.map((item) => {
                    const active = item.isActive();
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                                active ? 'text-blue-600' : 'text-gray-400'
                            }`}
                        >
                            <item.Icon active={active} />
                            <span className={`text-[10px] font-semibold ${active ? 'text-blue-600' : 'text-gray-400'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

