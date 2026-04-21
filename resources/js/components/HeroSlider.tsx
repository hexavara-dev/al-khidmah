import { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';

export interface SlideItem {
    id: number;
    title: string;
    subtitle?: string | null;
    button_text?: string | null;
    button_url?: string | null;
    image?: string | null;
    bg_color?: string | null;
}

const DEFAULT_SLIDES: SlideItem[] = [
    {
        id: 1,
        title: 'Bersama Membangun Kebaikan untuk Ummat',
        subtitle: 'Setiap donasi Anda adalah amal jariyah yang mengalir tanpa henti.',
        button_text: 'Mulai Donasi',
        button_url: '#campaigns',
        image: null,
        bg_color: '#008f92',
    },
    {
        id: 2,
        title: 'Tunaikan Zakat & Sedekah dengan Mudah',
        subtitle: 'Salurkan zakat, infaq, dan sedekah Anda kepada yang berhak menerimanya.',
        button_text: 'Lihat Program',
        button_url: '#campaigns',
        image: null,
        bg_color: '#00736b',
    },
    {
        id: 3,
        title: 'Bantu Saudara yang Membutuhkan',
        subtitle: 'Bergabunglah bersama ribuan donatur yang telah mempercayakan amal mereka.',
        button_text: 'Donasi Sekarang',
        button_url: '#campaigns',
        image: null,
        bg_color: '#00566b',
    },
];

interface Props {
    slides?: SlideItem[];
    className?: string;
}

export default function HeroSlider({ slides, className = '' }: Props) {
    const items = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
    const [current, setCurrent] = useState(0);
    const [transitioning, setTransitioning] = useState(false);

    const goTo = useCallback((idx: number) => {
        if (idx === current) return;
        setTransitioning(true);
        setTimeout(() => {
            setCurrent(idx);
            setTransitioning(false);
        }, 250);
    }, [current]);

    const next = useCallback(() => {
        goTo((current + 1) % items.length);
    }, [current, items.length, goTo]);

    useEffect(() => {
        const timer = setInterval(next, 4500);
        return () => clearInterval(timer);
    }, [next]);

    const slide = items[current];

    // Build gradient from bg_color
    const hex = slide.bg_color ?? '#008f92';

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ minHeight: 320 }}>
            {/* Background layers */}
            {items.map((s, i) => {
                const bg = s.bg_color ?? '#008f92';
                return (
                    <div
                        key={s.id}
                        className="absolute inset-0 transition-opacity duration-500"
                        style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
                    >
                        {s.image ? (
                            <>
                                <img
                                    src={`/storage/${s.image}`}
                                    alt={s.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50" />
                            </>
                        ) : (
                            <div
                                className="w-full h-full"
                                style={{
                                    background: `linear-gradient(135deg, ${bg} 0%, ${bg}aa 60%, #004f52 100%)`,
                                }}
                            />
                        )}
                    </div>
                );
            })}

            {/* Decorative circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-white/5" />
            </div>

            {/* Content */}
            <div
                className="relative flex flex-col items-center justify-center text-center text-white px-6 py-14 md:py-20 transition-opacity duration-250"
                style={{ zIndex: 3, opacity: transitioning ? 0 : 1 }}
            >
                <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-white/60 mb-3">
                    🌙 Al-Khidmah
                </p>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl mb-4">
                    {slide.title}
                </h1>
                {slide.subtitle && (
                    <p className="text-white/75 text-sm md:text-base max-w-xl mb-8 leading-relaxed">
                        {slide.subtitle}
                    </p>
                )}
                {slide.button_text && slide.button_url && (
                    <Link
                        href={slide.button_url}
                        className="inline-block bg-white text-[#008f92] font-bold px-8 py-3 rounded-full text-sm hover:bg-[#e0fafa] hover:shadow-xl transition-all shadow-md"
                    >
                        {slide.button_text}
                    </Link>
                )}
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2" style={{ zIndex: 4 }}>
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Slide ${i + 1}`}
                        className="transition-all duration-300 rounded-full"
                        style={{
                            width: i === current ? 24 : 8,
                            height: 8,
                            backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.4)',
                        }}
                    />
                ))}
            </div>

            {/* Prev / Next arrows (desktop) */}
            <button
                onClick={() => goTo((current - 1 + items.length) % items.length)}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition backdrop-blur-sm"
                style={{ zIndex: 4 }}
                aria-label="Slide sebelumnya"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <button
                onClick={() => goTo((current + 1) % items.length)}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition backdrop-blur-sm"
                style={{ zIndex: 4 }}
                aria-label="Slide berikutnya"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
}
