import { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
} from "lucide-react";
import type { PageProps } from "@/types";
import type {
    PricelistItem,
    Operator,
    PostpaidBill,
    PostpaidProvider,
    PlnCustomer,
} from "@/types/PPOB";
import { services, idr } from "@/lib/PPOB";
import phonePrefix from "@/lib/phonePrefix";
import Navbar from "@/components/ui/Navbar";
import BottomNav from "@/components/ui/BottomNav";
import NumberInputBar from "@/components/PPOB/NumberInputBar";
import ProductList from "@/components/PPOB/ProductList";
import BillInquiryCard from "@/components/PPOB/BillInquiryCard";
import ConfirmModal from "@/components/PPOB/ConfirmModal";
import ProviderSelector from "@/components/PPOB/ProviderSelector";

type RecentTx = {
    id: number;
    customer_id: string;
    product_code: string;
    price: number;
    payment_status: string;
    status: number;
    created_at: string;
};

type Props = PageProps<{
    serviceType: string;
    balance: number;
    recentTransactions: RecentTx[];
}>;

const sectionTitle: Record<string, string> = {
    pln: "Pilih Nominal Token",
    pulsa: "Pilih Nominal Pulsa",
    data: "Pilih Paket Data",
    etoll: "Pilih Nominal Top-up",
    tv: "Pilih Paket Berlangganan",
    pln_pasca: "Informasi Tagihan",
};

function TxStatusBadge({
    status,
    paymentStatus,
}: {
    status: number;
    paymentStatus: string;
}) {
    const ok =
        paymentStatus === "settlement" ||
        paymentStatus === "capture" ||
        status === 1;
    const fail =
        ["cancel", "deny", "expire", "failure"].includes(paymentStatus) ||
        status === 2;
    if (ok)
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 className="size-3" />
                Berhasil
            </span>
        );
    if (fail)
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-500">
                <XCircle className="size-3" />
                Gagal
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600">
            <Clock className="size-3" />
            Menunggu
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────
   Desktop-only sticky payment sidebar (col-3 / rightmost panel)
───────────────────────────────────────────────────────────── */
function DesktopPaymentSidebar({
    service,
    phoneNumber,
    operator,
    plnCustomer,
    selectedItem,
    billData,
    onConfirmItem,
    onConfirmBill,
}: {
    service: NonNullable<ReturnType<typeof services.find>>;
    phoneNumber: string;
    operator: Operator | null;
    plnCustomer: PlnCustomer | null;
    selectedItem: PricelistItem | null;
    billData: PostpaidBill | null;
    onConfirmItem: (item: PricelistItem) => void;
    onConfirmBill: (bill: PostpaidBill) => void;
}) {
    const hasPayment = selectedItem !== null || (billData !== null && !billData.already_paid);
    const price = selectedItem?.product_price ?? billData?.price ?? 0;
    const productLabel =
        selectedItem?.product_description  ?? "-";

    return (
        <div className="sticky top-32 flex flex-col gap-3 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
            {" "}
            {/* ── Ringkasan pembayaran card ── */}
            <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
                {/* Card header */}
                <div className="border-b border-outline-variant/10 bg-surface-container/40 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Informasi Pembayaran
                    </p>
                </div>

                <div className="px-4 py-4 space-y-3 text-sm">
                    {/* Nomor */}
                    <div className="flex items-center justify-between gap-3">
                        <p className="shrink-0 text-xs text-on-surface-variant">
                            Nomor
                        </p>
                        <p className="truncate text-xs font-semibold text-on-surface text-right">
                            {phoneNumber || "—"}
                        </p>
                    </div>

                    {/* Operator */}
                    {operator && (
                        <div className="flex items-center justify-between gap-3">
                            <p className="shrink-0 text-xs text-on-surface-variant">
                                Operator
                            </p>
                            <div className="flex items-center gap-1.5">
                                {operator.image && (
                                    <img
                                        src={operator.image}
                                        alt={operator.name}
                                        className="h-4 w-4 rounded-full object-contain"
                                    />
                                )}
                                <p className="text-xs font-semibold text-on-surface">
                                    {operator.name}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* PLN info */}
                    {plnCustomer?.name && (
                        <div className="flex items-center justify-between gap-3">
                            <p className="shrink-0 text-xs text-on-surface-variant">
                                Nama
                            </p>
                            <p className="truncate text-xs font-semibold text-on-surface text-right">
                                {plnCustomer.name}
                            </p>
                        </div>
                    )}
                    {plnCustomer?.meter_no && (
                        <div className="flex items-center justify-between gap-3">
                            <p className="shrink-0 text-xs text-on-surface-variant">
                                No. Meter
                            </p>
                            <p className="text-xs font-semibold text-on-surface">
                                {plnCustomer.meter_no}
                            </p>
                        </div>
                    )}
                    {plnCustomer?.segment_power && (
                        <div className="flex items-center justify-between gap-3">
                            <p className="shrink-0 text-xs text-on-surface-variant">
                                Daya
                            </p>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                {plnCustomer.segment_power}
                            </span>
                        </div>
                    )}

                    {/* Divider + produk + total */}
                    {hasPayment ? (
                        <div className="border-t border-outline-variant/10 pt-3 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <p className="shrink-0 text-xs text-on-surface-variant">
                                    Produk
                                </p>
                                <p className="text-xs font-semibold text-on-surface text-right leading-relaxed">
                                    {productLabel}
                                </p>
                            </div>
                            <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/5 px-3 py-2.5">
                                <p className="text-xs font-medium text-on-surface-variant">
                                    Total
                                </p>
                                <p className="text-base font-bold text-primary">
                                    {idr.format(price)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="border-t border-outline-variant/10 pt-4 pb-2 text-center">
                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container">
                                <service.icon className="size-5 text-on-surface-variant/50" />
                            </div>
                            <p className="text-[11px] text-on-surface-variant/70 leading-relaxed">
                                Pilih produk untuk melihat
                                <br />
                                ringkasan pembayaran
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {/* ── CTA button ── */}
            <button
                disabled={!hasPayment}
                onClick={() => {
                    if (selectedItem) onConfirmItem(selectedItem);
                    else if (billData) onConfirmBill(billData);
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition active:scale-[0.98] ${
                    hasPayment
                        ? "bg-primary text-on-primary hover:bg-primary-dim cursor-pointer"
                        : "bg-surface-container text-on-surface-variant cursor-not-allowed"
                }`}
            >
                Lanjutkan ke Pembayaran
                <ChevronRight className="size-4" />
            </button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════ */

export default function ServicePage({
    serviceType,
    balance,
    recentTransactions,
}: Props) {
    const service = services.find((s) => s.type === serviceType);
    if (!service) return null;

    const [phoneNumber, setPhoneNumber] = useState("");
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [operator, setOperator] = useState<Operator | null>(null);
    const [emoneyProvider, setEmoneyProvider] = useState("");
    const [prepaidService, setPrepaidService] = useState<
        PricelistItem[] | null
    >(null);
    const [billData, setBillData] = useState<PostpaidBill | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmItem, setConfirmItem] = useState<PricelistItem | null>(null);
    const [confirmBill, setConfirmBill] = useState<PostpaidBill | null>(null);
    const [tvProviders, setTvProviders] = useState<PostpaidProvider[] | null>(
        null,
    );
    const [tvLoading, setTvLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] =
        useState<PostpaidProvider | null>(null);
    const [plnCustomer, setPlnCustomer] = useState<PlnCustomer | null>(null);
    const [selectedItem, setSelectedItem] = useState<PricelistItem | null>(
        null,
    );
    const [emoneyItems, setEmoneyItems] = useState<PricelistItem[]>([]);

    useEffect(() => {
        if (serviceType !== "etoll") return;
        fetch("/ppob/pricelist/etoll")
            .then((r) => r.json())
            .then((d) => setEmoneyItems(d?.data?.pricelist ?? []));
    }, [serviceType]);

    useEffect(() => {
        if (serviceType !== "tv") return;
        let cancelled = false;
        setTvLoading(true);
        Promise.all([
            fetch("/ppob/pricelist-pasca/tv").then((r) => r.json()),
            fetch("/ppob/pricelist-pasca/internet").then((r) => r.json()),
        ])
            .then(([tv, internet]) => {
                if (!cancelled) {
                    setTvProviders([
                        ...(tv?.data?.pasca ?? []),
                        ...(internet?.data?.pasca ?? []),
                    ]);
                    setTvLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setTvProviders([]);
                    setTvLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [serviceType]);

    const handleCheck = async () => {
        setIsLoading(true);
        setPrepaidService(null);
        setBillData(null);
        setSelectedItem(null);

        try {
            if (service.type === "pln_pasca" || service.type === "tv") {
                const isTv = service.type === "tv";
                if (isTv && !selectedProvider) return;
                const csrf =
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content ?? "";
                const iakType = isTv
                    ? selectedProvider!.type === "internet"
                        ? "internet_pasca"
                        : "tv_pasca"
                    : "pln_pasca";
                const res = await fetch("/ppob/inquiry", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrf,
                    },
                    body: JSON.stringify({
                        customer_id: phoneNumber,
                        product_code: isTv
                            ? selectedProvider!.code
                            : "PLNPOSTPAID",
                        type: iakType,
                    }),
                });
                if (!res.ok) return;
                const data = res.headers
                    .get("content-type")
                    ?.includes("application/json")
                    ? await res.json()
                    : null;
                if (data) setBillData(data);
            } else {
                const data = await fetch(
                    `/ppob/pricelist/${service.type}`,
                ).then((r) => r.json());
                const all: PricelistItem[] = data?.data?.pricelist ?? [];
                const isEmoney = service.type === "etoll";
                const key = (
                    isEmoney ? emoneyProvider : (operator?.apiName ?? "")
                ).toLowerCase();

                if (key && (service.type === "pulsa" || service.type === "data" || service.type === "etoll")) {
                    // Filter by operator/provider name — DB products have provider in label/code
                    const filtered = all
                        .filter((item) => {
                            const d = item.product_description.toLowerCase();
                            const c = item.product_code.toLowerCase();
                            return d.includes(key) || c.includes(key);
                        });
                    setPrepaidService(filtered);
                } else if (
                    service.type === "pln" &&
                    service.endpoint === "prepaid"
                ) {
                    // DB already contains only curated PLN products
                    setPrepaidService(phoneNumber ? all : []);
                    if (phoneNumber) {
                        try {
                            const r = await fetch(
                                `/ppob/inquiry-pln/${encodeURIComponent(phoneNumber)}`,
                            );
                            if (r.ok) setPlnCustomer(await r.json());
                        } catch {
                            /* fallback */
                        }
                    }
                } else {
                    setPrepaidService(all);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setPhoneNumber(v);
        setSelectedItem(null);

        if (
            (service.type === "pln" && service.endpoint === "prepaid") ||
            service.type === "pln_pasca"
        ) {
            setIsValid(
                v.length === 0 ? null : v.length >= 11 && v.length <= 12,
            );
            return;
        }
        if (service.type === "tv") {
            setIsValid(v.length === 0 ? null : v.length >= 4);
            return;
        }
        const isPhone = service.type === "pulsa" || service.type === "data";
        if (!isPhone) {
            setIsValid(null);
            return;
        }
        if (v.length < 4) {
            setOperator(null);
            setIsValid(null);
            return;
        }
        const match = Object.entries(phonePrefix).find(([, d]) =>
            (d as { prefixes: string[] }).prefixes.includes(v.slice(0, 4)),
        );
        setOperator(
            match
                ? {
                      name: match[0],
                      image: (match[1] as { image: string }).image,
                      apiName: (match[1] as { apiName: string }).apiName,
                  }
                : null,
        );
        setIsValid(v.length >= 10 ? /^08\d{8,11}$/.test(v) : null);
    };

    const serviceLabel =
        service.type === "tv"
            ? (selectedProvider?.name ?? service.label)
            : service.label;
    const hasResult = billData !== null || prepaidService !== null;
    const buttonLabel =
        service.type === "pln" && service.endpoint === "prepaid"
            ? "Cek Token"
            : service.type === "pln_pasca" || service.type === "tv"
              ? "Cek Tagihan"
              : "Cek Layanan";

    const isTv = service.type === "tv";

    return (
        <>
            <Head title={service.label} />

            {isLoading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-bright/80 backdrop-blur-sm">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
                    <p className="mt-4 text-sm font-medium text-primary">
                        Memuat data...
                    </p>
                </div>
            )}

            <Navbar balance={balance} />

            <div className="min-h-screen bg-surface-bright pt-17">
                {/* ── Service sub-header ── */}
                <div className="sticky top-17 z-20 flex items-center justify-between gap-3 border-b border-outline-variant/10 bg-surface-bright/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant transition hover:bg-surface-container-high"
                        >
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-container">
                                <service.icon className="size-4 text-primary" />
                            </div>
                            <h1 className="font-headline text-base font-bold text-on-surface">
                                {service.label}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* ── Content wrapper ── */}
                <div className="mx-auto w-full max-w-screen-xl px-4 py-6 pb-64 sm:pb-40 sm:px-6 lg:px-8">

                    {isTv ? (
                        <div className="sm:grid sm:grid-cols-[1fr_1.2fr] sm:gap-6 sm:items-start">
                            <div className="mb-5 sm:mb-0">
                                {tvLoading ? (
                                    <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-sm text-primary">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
                                        Memuat penyedia layanan...
                                    </div>
                                ) : (
                                    <ProviderSelector
                                        providers={tvProviders ?? []}
                                        selected={
                                            selectedProvider?.code ?? null
                                        }
                                        onSelect={setSelectedProvider}
                                    />
                                )}
                            </div>

                            <div>
                                {selectedProvider !== null && (
                                    <div className="mb-5 scroll-mt-32 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm">
                                        <NumberInputBar
                                            value={phoneNumber}
                                            placeholder={service.placeholder}
                                            isValid={isValid}
                                            onChange={handleChange}
                                            onCheck={handleCheck}
                                            buttonLabel={buttonLabel}
                                            type={service.type}
                                            emoneyProvider={emoneyProvider}
                                            emoneyItems={emoneyItems}
                                            onEmoneyChange={setEmoneyProvider}
                                        />
                                    </div>
                                )}

                                {!hasResult && (
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 py-16 text-center">
                                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container">
                                            <service.icon className="size-7 text-on-surface-variant" />
                                        </div>
                                        <p className="text-sm font-semibold text-on-surface">
                                            Siap melayani
                                        </p>
                                        <p className="mt-1 max-w-xs text-xs text-on-surface-variant">
                                            {!selectedProvider
                                                ? "Pilih penyedia layanan di sebelah kiri terlebih dahulu."
                                                : "Masukkan nomor di atas lalu klik tombol cek."}
                                        </p>
                                    </div>
                                )}

                                {billData && (
                                    <BillInquiryCard
                                        bill={billData}
                                        customerNumber={phoneNumber}
                                        serviceType={service.type}
                                        serviceLabel={serviceLabel}
                                        onPay={(bill) => setConfirmBill(bill)}
                                    />
                                )}
                            </div>

                        </div>
                    ) : (
                        /* ══════════════════════════════════════════════════
                            NON-TV
                            Desktop  → col-9 (input + pricelist) | col-3 (sticky sidebar)
                            Mobile   → single column + floating CTA bar
                        ══════════════════════════════════════════════════ */
                        <div className="sm:grid sm:grid-cols-[1fr_280px] md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] sm:gap-6 sm:items-start">
                            {/* ── Kiri: input + product results ── */}
                            <div className="min-w-0">
                                {/* Input card */}
                                <div className="mb-5 scroll-mt-32 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm">
                                    <NumberInputBar
                                        value={phoneNumber}
                                        placeholder={service.placeholder}
                                        isValid={isValid}
                                        onChange={handleChange}
                                        onCheck={handleCheck}
                                        operator={
                                            service.type === "pulsa" ||
                                            service.type === "data"
                                                ? operator
                                                : undefined
                                        }
                                        buttonLabel={buttonLabel}
                                        type={service.type}
                                        emoneyProvider={emoneyProvider}
                                        emoneyItems={emoneyItems}
                                        onEmoneyChange={setEmoneyProvider}
                                    />
                                </div>

                                {/* Empty state */}
                                {!hasResult && (
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 py-20 text-center">
                                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container">
                                            <service.icon className="size-7 text-on-surface-variant" />
                                        </div>
                                        <p className="text-sm font-semibold text-on-surface">
                                            Siap melayani
                                        </p>
                                        <p className="mt-1 max-w-xs text-xs text-on-surface-variant">
                                            Masukkan nomor di atas lalu klik
                                            tombol cek.
                                        </p>
                                    </div>
                                )}

                                {/* Bill inquiry card (postpaid) */}
                                {billData && (
                                    <BillInquiryCard
                                        bill={billData}
                                        customerNumber={phoneNumber}
                                        serviceType={service.type}
                                        serviceLabel={serviceLabel}
                                        onPay={(bill) => setConfirmBill(bill)}
                                    />
                                )}

                                {/* PLN customer info card */}
                                {plnCustomer?.name && (
                                    <div className="mb-5 flex items-center gap-4 overflow-hidden rounded-2xl bg-primary px-5 py-4 shadow-md shadow-primary/20">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                                            <svg className="size-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <circle cx="12" cy="8" r="4" />
                                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-white/60">
                                                Informasi Pelanggan
                                            </p>
                                            <p className="font-headline text-lg font-bold leading-tight text-white">
                                                {plnCustomer.name}
                                            </p>
                                            {plnCustomer.segment_power && (
                                                <p className="mt-0.5 text-xs text-white/70">
                                                    Tarif/Daya: {plnCustomer.segment_power}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Prepaid product grid */}
                                {prepaidService !== null && (
                                    <>
                                        {prepaidService.length > 0 && (
                                            <div className="mb-4 flex items-center justify-between">
                                                <h2 className="font-headline text-base font-bold text-on-surface">
                                                    {sectionTitle[
                                                        service.type
                                                    ] ?? "Pilih Produk"}
                                                </h2>
                                            </div>
                                        )}
                                        <ProductList
                                            items={prepaidService}
                                            selected={service}
                                            operator={operator}
                                            onBuy={setConfirmItem}
                                            customerNumber={phoneNumber}
                                            plnCustomer={plnCustomer}
                                            selectedItem={selectedItem}
                                            onSelectItem={setSelectedItem}
                                        />
                                    </>
                                )}
                            </div>

                            {/* ── Kanan: sticky payment sidebar — DESKTOP ONLY ── */}
                            <div className="hidden sm:block">
                                <DesktopPaymentSidebar
                                    service={service}
                                    phoneNumber={phoneNumber}
                                    operator={operator}
                                    plnCustomer={plnCustomer}
                                    selectedItem={selectedItem}
                                    billData={billData}
                                    onConfirmItem={setConfirmItem}
                                    onConfirmBill={setConfirmBill}
                                />
                            </div>
                        </div>
                    )}
                    {/* ── Pembelian Terakhir — full width semua layout ── */}
                    {recentTransactions.length > 0 && (
                        <div className="mt-8">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-headline text-base font-bold text-on-surface">
                                    Pembelian Terakhir
                                </h2>
                                <Link
                                    href="/history"
                                    className="text-[10px] font-bold uppercase tracking-wider text-primary transition hover:text-primary-dim"
                                >
                                    Lihat Semua
                                </Link>
                            </div>
                            <div className="space-y-2.5">
                                {recentTransactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center gap-3 overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 shadow-sm"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container/60">
                                            <service.icon className="size-5 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-on-surface">
                                                {idr.format(tx.price)}
                                            </p>
                                            <p className="text-xs text-on-surface-variant">
                                                {tx.created_at}
                                            </p>
                                        </div>
                                        <TxStatusBadge
                                            status={tx.status}
                                            paymentStatus={tx.payment_status}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ══════════════════════════════════════════════════
                    MOBILE ONLY floating CTA bar  (hidden sm:hidden)
                ══════════════════════════════════════════════════ */}

                {/* Bill CTA */}
                {billData && !selectedItem && !billData.already_paid && (
                    <div className="fixed bottom-24 left-0 right-0 z-40 border-t border-outline-variant/10 bg-surface-bright/95 px-4 py-3 backdrop-blur-md md:hidden">
                        <div className="mx-auto max-w-2xl">
                            <div className="mb-2.5 flex items-center justify-between">
                                <p className="text-xs text-on-surface-variant">
                                    Total Tagihan
                                </p>
                                <p className="text-sm font-bold text-primary">
                                    {idr.format(billData.price)}
                                </p>
                            </div>
                            <button
                                onClick={() => setConfirmBill(billData)}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-on-primary transition hover:bg-primary-dim active:scale-[0.98]"
                            >
                                Lanjutkan ke Pembayaran
                                <svg
                                    className="size-4"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <path
                                        d="M6 12l4-4-4-4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Prepaid selected CTA */}
                {selectedItem && (
                    <div className="fixed bottom-24 left-0 right-0 z-40 border-t border-outline-variant/10 bg-surface-bright/95 px-4 py-3 backdrop-blur-md sm:hidden">
                        <div className="mx-auto max-w-2xl">
                            <div className="mb-2.5 flex items-center justify-between">
                                <p className="text-xs text-on-surface-variant">
                                    {selectedItem.product_description}
                                </p>
                                <p className="text-sm font-bold text-primary">
                                    {idr.format(selectedItem.product_price)}
                                </p>
                            </div>
                            <button
                                onClick={() => setConfirmItem(selectedItem)}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-on-primary transition hover:bg-primary-dim active:scale-[0.98]"
                            >
                                Lanjutkan ke Pembayaran
                                <svg
                                    className="size-4"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <path
                                        d="M6 12l4-4-4-4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />

            <ConfirmModal
                show={confirmItem !== null}
                item={confirmItem}
                phoneNumber={phoneNumber}
                operator={operator}
                service={service}
                emoneyProvider={service.type === "etoll" ? emoneyProvider : undefined}
                onClose={() => setConfirmItem(null)}
            />
            <ConfirmModal
                show={confirmBill !== null}
                bill={confirmBill}
                serviceType={service.type}
                serviceLabel={serviceLabel}
                onClose={() => setConfirmBill(null)}
            />
        </>
    );
}
