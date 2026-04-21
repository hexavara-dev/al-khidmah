import { Head, router } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { services } from '@/lib/ppob';
import Navbar from '@/components/ui/Navbar';
import BottomNav from '@/components/ui/BottomNav';
import ServiceCard from '@/components/ppob/ServiceCard';

type HomepageProps = PageProps<{ balance: number }>;

export default function Homepage({ balance }: HomepageProps) {
    return (
        <>
            <Head title="Layanan PPOB" />

            <Navbar balance={balance} />

            <div className="min-h-screen bg-surface-bright pt-[68px] pb-28">
                {/* Hero */}
                <section className="mx-auto max-w-7xl px-6 pb-8 pt-12">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-xs font-medium text-primary">
                            Payment Point Online Bank, Donasi, dan Store
                        </span>
                    </div>
                    <h1 className="font-headline mt-4 max-w-xl text-3xl font-extrabold leading-snug text-on-surface sm:text-4xl">
                        <br />
                        <span className="text-primary">
                            eKhidmah Oase Dunia
                        </span>
                    </h1>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-on-surface-variant">
                        Membawa cita-cita mulia sebagai oase dunia dengan
                        mengalirkan kebaikan, keberkahan, dan kemudahan dalam
                        setiap langkah kehidupan.
                    </p>
                </section>

                {/* Digital Services */}
                <section className="mx-auto max-w-7xl px-6 pb-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="font-headline text-xl font-bold text-on-surface">
                            Digital Services
                        </h2>
                        <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-primary">
                            {services.length} layanan
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {services.map((s) => (
                            <ServiceCard
                                key={s.label}
                                service={s}
                                isSelected={false}
                                onClick={() => router.visit(`/ppob/${s.type}`)}
                            />
                        ))}
                    </div>
                </section>
            </div>

            <BottomNav active="beranda" />
        </>
    );
}
