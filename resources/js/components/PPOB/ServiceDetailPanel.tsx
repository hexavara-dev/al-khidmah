import { ArrowLeft } from 'lucide-react';
import type { Service } from '@/types/PPOB';

type Props = {
    service: Service;
    onBack: () => void;
    sidebar: React.ReactNode;
    content: React.ReactNode;
};

export default function ServiceDetailPanel({ service, onBack, sidebar, content }: Props) {
    return (
        <section className="mx-auto max-w-7xl px-6 pb-12">
            {/* Header bar */}
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-6 py-4 shadow-sm">
                <button
                    onClick={onBack}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
                >
                    <ArrowLeft className="size-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container shadow-sm">
                        <service.icon className="size-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-headline text-base font-bold text-on-surface">{service.label}</h3>
                        <p className="text-xs text-on-surface-variant">{service.sub}</p>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Left: input / provider */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
                        {sidebar}
                    </div>
                </div>

                {/* Right: products / bill */}
                <div className="lg:col-span-3">
                    {content}
                </div>
            </div>
        </section>
    );
}
