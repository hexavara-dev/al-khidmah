import { Bell, Search, CircleDollarSign } from 'lucide-react';

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

type Props = {
    balance: number;
    appName?: string;
};

export default function Navbar({ balance, appName = 'Al-Khidmah' }: Props) {
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
                    <a href="#" className="rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-primary transition-all">
                        Dashboard
                    </a>
                    <a href="#" className="rounded-xl px-4 py-2 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-low">
                        Layanan
                    </a>
                    <a href="#" className="rounded-xl px-4 py-2 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-low">
                        Riwayat
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

                    {/* Avatar */}
                    <div className="h-10 w-10 flex-shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-primary-container p-0.5">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-container">
                            <span className="font-headline text-xs font-bold text-primary">AK</span>
                        </div>
                    </div>
                </div>

            </div>
        </nav>
    );
}
