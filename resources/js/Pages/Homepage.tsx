import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Smartphone, Wifi, Tv2, Zap, Wallet,
    FileText, CircleDollarSign, ArrowRight, X, Loader2,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { PageProps } from '@/types';

type Service = { label: string; sub: string; type: string; icon: ComponentType<{ className?: string }> };

const services: Service[] = [
    { label: 'Pulsa',                     sub: 'Prepaid Mobile',           type: 'pulsa',   icon: Smartphone },
    { label: 'Paket Data',                sub: 'Internet',                 type: 'data',    icon: Wifi       },
    { label: 'TV Kabel / Internet Rumah', sub: 'Berlangganan bulanan',     type: 'voucher', icon: Tv2        },
    { label: 'Token Listrik',             sub: 'PLN Prepaid',              type: 'pln',     icon: Zap        },
    { label: 'Top Up E-Money',            sub: 'OVO, GoPay, dan lainnya',  type: 'etoll',   icon: Wallet     },
    { label: 'PLN Pascabayar',            sub: 'Tagihan listrik bulanan',  type: 'pln',     icon: FileText   },
];

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

type HomepageProps = PageProps<{ balance: number }>;

export default function Homepage({ balance }: HomepageProps) {
    const [selected, setSelected] = useState<Service | null>(null);
    const [data, setData]         = useState<unknown>(null);
    const [loading, setLoading]   = useState(false);

    const openPricelist = async (service: Service) => {
        setSelected(service);
        setData(null);
        setLoading(true);
        const res = await fetch(`/ppob/pricelist/${service.type}`);
        setData(await res.json());
        setLoading(false);
    };

    const closeModal = () => { setSelected(null); setData(null); };

    return (
        <>
            <Head title="Layanan PPOB" />

            <div className="min-h-screen bg-green-50 font-sans">
                {/* ── Navbar ── */}
                <header className="border-b border-green-100 bg-white/80 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                                <CircleDollarSign className="size-4 text-white" />
                            </div>
                            <span className="text-base font-semibold text-green-900">Al-Khidmah</span>
                        </div>

                        <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs font-medium text-green-700">Saldo</span>
                            <span className="text-sm font-semibold text-green-900">{idr.format(balance ?? 0)}</span>
                        </div>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section className="mx-auto max-w-6xl px-6 pb-8 pt-12">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-xs font-medium text-green-600">Payment Point Online Bank</span>
                    </div>
                    <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-snug text-gray-900 sm:text-4xl">
                        Layanan pembayaran<br />
                        <span className="text-green-600">digital terpercaya.</span>
                    </h1>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-gray-500">
                        Tersedia enam kategori layanan PPOB yang bisa kamu akses kapan saja dan di mana saja dengan aman dan cepat.
                    </p>
                </section>

                {/* ── Service Cards ── */}
                <section className="mx-auto max-w-6xl px-6 pb-16">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-green-700">Layanan Tersedia</h2>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {services.length} layanan
                        </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {services.map((s, i) => (
                            <div
                                key={s.label}
                                className="group cursor-pointer rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition duration-200 hover:border-green-300 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600 transition duration-200 group-hover:bg-green-600 group-hover:text-white">
                                        <s.icon className="size-6" />
                                    </div>
                                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
                                        #{i + 1}
                                    </span>
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-gray-900">{s.label}</h3>
                                <p className="mt-1 text-sm text-gray-400">{s.sub}</p>

                                <button
                                    onClick={() => openPricelist(s)}
                                    className="mt-5 flex items-center gap-1.5 text-xs font-medium text-green-600 opacity-0 transition duration-200 group-hover:opacity-100 hover:underline"
                                >
                                    <span>Lihat pricelist</span>
                                    <ArrowRight className="size-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-green-100 bg-white py-6">
                    <p className="text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Al-Khidmah. Didukung oleh IAK PPOB.
                    </p>
                </footer>
            </div>

            {/* ── Pricelist Modal ── */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-green-100 px-6 py-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-green-600">Pricelist</p>
                                <h2 className="text-base font-semibold text-gray-900">{selected.label}</h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-6">
                            {loading
                                ? <div className="flex items-center justify-center py-16 text-green-600">
                                    <Loader2 className="size-6 animate-spin" />
                                    <span className="ml-2 text-sm">Memuat pricelist...</span>
                                  </div>
                                : <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-gray-950 p-4 text-xs leading-6 text-green-300">
                                    {JSON.stringify(data, null, 2)}
                                  </pre>
                            }
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
