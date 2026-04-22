import { Head } from '@inertiajs/react';
import { Zap } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="size-5 flex-shrink-0" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const JemaahIcon = () => (
    <svg className="size-5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L3 7v5c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7l-9-5z" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function SsoCard({ status }: { status?: string }) {
    // Deteksi mobile: cek URL atau sessionStorage (agar tetap ada setelah navigasi)
    const fromUrl = new URLSearchParams(window.location.search).get('mobile') === '1';
    if (fromUrl) sessionStorage.setItem('mobile', '1');
    const isMobile = fromUrl || sessionStorage.getItem('mobile') === '1';
    const googleHref = isMobile ? '/auth/google?mobile=1' : '/auth/google';

    return (
        <div className="flex flex-col">
            {status && (
                <div className="mb-5 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground">
                    {status}
                </div>
            )}

            {/* Greeting */}
            <div className="mb-6 flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        Selamat Datang
                    </span>
                </div>
                <h2 className="font-headline text-2xl font-extrabold text-foreground">
                    Masuk ke eKhidmah
                </h2>
                <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                    Pilih metode masuk yang Anda gunakan.
                </p>
            </div>

            {/* SSO Buttons */}
            <div className="space-y-3">
                {/* Jemaah eKhidmah */}
                <a
                    href="/auth/jemaah"
                    className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06] px-5 py-4 transition hover:bg-primary/10 hover:shadow-md active:scale-[0.98]"
                >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15">
                        <JemaahIcon />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-primary">
                            Jemaah eKhidmah
                        </p>
                        <p className="text-xs text-primary/60">
                            Masuk sebagai jemaah
                        </p>
                    </div>
                    <svg
                        className="size-4 text-primary/40 transition group-hover:translate-x-0.5 group-hover:text-primary"
                        viewBox="0 0 16 16"
                        fill="none"
                    >
                        <path
                            d="M6 12l4-4-4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </a>

                {/* Google */}
                <a
                    href={googleHref}
                    className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-border bg-background px-5 py-4 shadow-sm transition hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
                >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-white shadow-sm">
                        <GoogleIcon />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">
                            Masuk dengan Google
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Gunakan akun Google Anda
                        </p>
                    </div>
                    <svg
                        className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                        viewBox="0 0 16 16"
                        fill="none"
                    >
                        <path
                            d="M6 12l4-4-4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </a>
            </div>
        </div>
    );
}

export default function Login({ status }: { status?: string; canResetPassword: boolean }) {
    return (
        <>
            <Head title="Masuk" />

            {/* ── MOBILE (< lg) ── */}
            <div className="flex min-h-screen flex-col items-center justify-start overflow-hidden bg-surface-container-low px-4 pb-10 pt-14 lg:hidden sm:justify-center sm:pt-0">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/[0.08]" />
                    <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent" />
                </div>

                {/* Mobile logo */}
                <div className="relative mb-8 flex flex-col items-center text-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-container-lowest shadow-md">
                        <Zap className="size-9 text-primary" strokeWidth={2.5} />
                    </div>
                    <h1 className="font-headline text-3xl font-extrabold text-primary">eKhidmah</h1>
                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">Kelola finansial Anda dengan tenang dan berkah.</p>
                </div>

                <div className="relative w-full max-w-sm rounded-3xl bg-surface-container-lowest px-6 py-7 shadow-lg">
                    <SsoCard status={status} />
                </div>
            </div>

            {/* ── DESKTOP (>= lg) ── */}
            <div className="hidden min-h-screen lg:flex">
                {/* Left — branding */}
                <div className="relative flex w-1/2 flex-col justify-between overflow-hidden bg-primary p-12">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
                        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5" />
                        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03]" />
                    </div>

                    {/* Logo */}
                    <div className="relative flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                            <Zap className="size-5 text-white" />
                        </div>
                        <span className="font-headline text-xl font-extrabold tracking-tight text-white">eKhidmah</span>
                    </div>

                    {/* Center copy */}
                    <div className="relative">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            <span className="text-xs font-medium text-white/80">Payment Point Online Bank</span>
                        </div>
                        <h1 className="font-headline text-4xl font-extrabold leading-snug text-white">
                            Layanan pembayaran<br />
                            <span className="text-white/70">digital terpercaya.</span>
                        </h1>
                        <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
                            Bayar tagihan listrik, internet, pulsa, dan berbagai layanan lainnya dengan mudah, cepat, dan aman.
                        </p>
                    </div>

                    <p className="relative text-xs text-white/40">
                        © {new Date().getFullYear()} eKhidmah. All rights reserved.
                    </p>
                </div>

                {/* Right — card */}
                <div className="flex w-1/2 items-center justify-center bg-surface-container-low px-8 py-12">
                    <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest px-8 py-10 shadow-lg">
                        <SsoCard status={status} />
                    </div>
                </div>
            </div>
        </>
    );
}

