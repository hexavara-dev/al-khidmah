import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Home,
    ScrollText,
    Banknote,
    CircleUser,
    HandCoins,
    HardHat,
} from "lucide-react";

type NavItem = {
    key: string;
    label: string;
    icon: typeof Home;
    href: string;
    wip?: boolean;
    matchPaths?: string[];
};

const navItems: NavItem[] = [
    {
        key: "ppob",
        label: "PPOB",
        icon: Home,
        href: "/",
        matchPaths: ["/", "/ppob"],
    },
    {
        key: "donasi",
        label: "Donasi",
        icon: HandCoins,
        href: "/donasi",
        matchPaths: ["/donasi", "/campaigns"],
    },
    { key: "store", label: "Store", icon: Banknote, href: "#", wip: true },
    {
        key: "riwayat",
        label: "Riwayat",
        icon: ScrollText,
        href: "/history",
        matchPaths: ["/history", "/my-donations"],
    },
];
type Props = {
    active?: string;
};

export default function BottomNav({ active }: Props) {
    const { url } = usePage();
    const [wipToast, setWipToast] = useState(false);

    const cleanUrl = url.split("?")[0].replace(/\/$/, "") || "/";

    const resolvedActive =
        active ??
        navItems.find((item) =>
            item.matchPaths?.some((p) =>
                p === "/" ? cleanUrl === "/" : cleanUrl.startsWith(p),
            ),
        )?.key ??
        "ppob";

    useEffect(() => {
        if (!wipToast) return;
        const t = setTimeout(() => setWipToast(false), 2500);
        return () => clearTimeout(t);
    }, [wipToast]);

    return (
        <>
            <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <div className="flex justify-center pointer-events-auto">
                    <nav className="inline-flex items-center gap-0.5 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest/90 px-2 py-3 shadow-xl shadow-on-surface/10 backdrop-blur-xl">
                        {navItems.map(
                            ({ key, label, icon: Icon, href, wip }) => {
                                const isActive = resolvedActive === key;
                                const isDonasi = key === "donasi";
                                const activeColor = isDonasi
                                    ? "#00cacd"
                                    : undefined;
                                const activeBg = isDonasi
                                    ? "#00cacd1a"
                                    : undefined;

                                const inner = (
                                    <>
                                        <div
                                            className={`flex items-center justify-center rounded-2xl px-4 py-1.5 transition-all duration-200 ${
                                                isActive && !isDonasi
                                                    ? "bg-primary-container"
                                                    : ""
                                            }`}
                                            style={
                                                isActive && isDonasi
                                                    ? {
                                                          backgroundColor:
                                                              activeBg,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <Icon
                                                className={`size-6 transition-colors duration-200 ${
                                                    isActive && !isDonasi
                                                        ? "text-primary"
                                                        : isActive
                                                          ? ""
                                                          : "text-outline"
                                                }`}
                                                style={
                                                    isActive && isDonasi
                                                        ? { color: activeColor }
                                                        : undefined
                                                }
                                                strokeWidth={
                                                    isActive ? 2.5 : 1.5
                                                }
                                            />
                                        </div>
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                                                isActive && !isDonasi
                                                    ? "text-primary"
                                                    : isActive
                                                      ? ""
                                                      : "text-outline"
                                            }`}
                                            style={
                                                isActive && isDonasi
                                                    ? { color: activeColor }
                                                    : undefined
                                            }
                                        >
                                            {label}
                                        </span>
                                    </>
                                );

                                if (wip) {
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setWipToast(true)}
                                            className="flex flex-col items-center gap-1 px-1.5"
                                        >
                                            {inner}
                                        </button>
                                    );
                                }

                                return (
                                    <Link
                                        key={key}
                                        href={href}
                                        className="flex flex-col items-center gap-1 px-1.5"
                                    >
                                        {inner}
                                    </Link>
                                );
                            },
                        )}
                    </nav>
                </div>
            </div>

            {/* WIP toast */}
            <div
                className={`fixed bottom-28 left-1/2 z-60 -translate-x-1/2 transition-all duration-300 ${
                    wipToast
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0 pointer-events-none"
                }`}
            >
                <div className="flex items-center gap-2.5 rounded-2xl border border-outline-variant/20 bg-on-surface px-4 py-3 shadow-xl">
                    <HardHat className="size-4 shrink-0 text-amber-400" />
                    <p className="text-xs font-semibold text-surface-bright">
                        Fitur ini sedang dalam pengembangan
                    </p>
                </div>
            </div>
        </>
    );
}
