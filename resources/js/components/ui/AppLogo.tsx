/**
 * AppLogo — taruh file logo kamu di public/images/logo.png.
 * Gunakan variant="white" untuk latar gelap (logo di-filter jadi putih).
 * Selama file belum ada, fallback inisial ditampilkan.
 */

import { useState } from 'react';

type Props = {
    size?: number;
    variant?: 'default' | 'white';
    className?: string;
};

export default function AppLogo({ size = 36, variant = 'default', className = '' }: Props) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        // Fallback: kotak dengan inisial "AK"
        const isWhite = variant === 'white';
        return (
            <div
                className={`flex shrink-0 items-center justify-center rounded-xl font-headline font-extrabold ${
                    isWhite
                        ? 'bg-white/20 text-white'
                        : 'bg-primary text-on-primary'
                } ${className}`}
                style={{ width: size, height: size, fontSize: size * 0.36 }}
            >
                AK
            </div>
        );
    }

    return (
        <img
            src="/images/logo.png"
            alt="Al-Khidmah"
            width={size}
            height={size}
            onError={() => setFailed(true)}
            className={`shrink-0 object-contain ${variant === 'white' ? 'brightness-0 invert' : ''} ${className}`}
            style={{ width: size, height: size }}
        />
    );
}
