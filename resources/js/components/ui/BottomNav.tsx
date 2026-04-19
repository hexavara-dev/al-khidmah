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
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="flex justify-center pointer-events-auto">
                <nav className="inline-flex items-center gap-1 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest/90 px-3 py-3 shadow-xl shadow-on-surface/10 backdrop-blur-xl">
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

        </div>
    );
}
