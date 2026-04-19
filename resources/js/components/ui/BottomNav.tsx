import { Home, ScrollText, Banknote, CircleUser } from 'lucide-react';

type NavItem = {
    key: string;
    label: string;
    icon: typeof Home;
};

const navItems: NavItem[] = [
    { key: 'beranda',  label: 'Beranda',  icon: Home       },
    { key: 'riwayat', label: 'Riwayat',  icon: ScrollText },
    { key: 'tagihan', label: 'Tagihan',  icon: Banknote   },
    { key: 'profil',  label: 'Profil',   icon: CircleUser },
];

type Props = {
    active?: string;
    onChange?: (key: string) => void;
};

export default function BottomNav({ active = 'beranda', onChange }: Props) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-outline-variant/20 bg-surface-bright pt-4 pb-5">
            {/* Nav pill — centered, hugs content */}
            <div className="flex justify-center mb-6">
                <nav className="inline-flex items-center gap-1 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-3 shadow-lg shadow-on-surface/5">
                    {navItems.map(({ key, label, icon: Icon }) => {
                        const isActive = active === key;
                        return (
                            <button
                                key={key}
                                onClick={() => onChange?.(key)}
                                className="flex flex-col items-center gap-1 px-2"
                            >
                                <div className={`flex items-center justify-center rounded-2xl px-5 py-1.5 transition-all duration-200 ${
                                    isActive ? 'bg-primary-container' : ''
                                }`}>
                                    <Icon
                                        className={`size-6 transition-colors duration-200 ${
                                            isActive ? 'text-primary' : 'text-outline'
                                        }`}
                                        strokeWidth={isActive ? 2.5 : 1.5}
                                    />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                                    isActive ? 'text-primary' : 'text-outline'
                                }`}>
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Footer links — outside the white pill */}
            {/* <div className="flex justify-center gap-8 mb-2">
                <a href="#" className="text-xs text-on-surface-variant transition-colors hover:text-primary">Privacy Policy</a>
                <a href="#" className="text-xs text-on-surface-variant transition-colors hover:text-primary">Terms of Service</a>
                <a href="#" className="text-xs text-on-surface-variant transition-colors hover:text-primary">Contact Us</a>
            </div>
            <p className="text-center text-xs text-on-surface-variant">
                &copy; {new Date().getFullYear()} Al-Khidmah. Didukung oleh IAK PPOB.
            </p> */}
        </div>
    );
}
