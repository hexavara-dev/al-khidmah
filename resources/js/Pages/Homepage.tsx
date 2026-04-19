import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import type { PageProps } from '@/types';
import type { Service, PricelistItem, Operator, PostpaidBill, PostpaidProvider, PlnCustomer } from '@/types/ppob';
import { services } from '@/lib/ppob';
import phonePrefix from '@/lib/phonePrefix';
import Navbar from '@/components/ui/Navbar';
import BottomNav from '@/components/ui/BottomNav';
import ServiceCard from '@/components/ppob/ServiceCard';
import ServiceDetailPanel from '@/components/ppob/ServiceDetailPanel';
import NumberInputBar from '@/components/ppob/NumberInputBar';
import ProductList from '@/components/ppob/ProductList';
import BillInquiryCard from '@/components/ppob/BillInquiryCard';
import ConfirmModal from '@/components/ppob/ConfirmModal';
import ProviderSelector from '@/components/ppob/ProviderSelector';

type HomepageProps = PageProps<{ balance: number }>;

export default function Homepage({ balance }: HomepageProps) {
    const [selected, setSelected] = useState<Service | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [operator, setOperator] = useState<Operator | null>(null);
    const [emoneyProvider, setEmoneyProvider] = useState<string>('');
    const [prepaidService, setPrepaidService] = useState<PricelistItem[] | null>(null);
    const [billData, setBillData] = useState<PostpaidBill | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmItem, setConfirmItem] = useState<PricelistItem | null>(null);
    const [confirmBill, setConfirmBill] = useState<PostpaidBill | null>(null);
    const [tvProviders, setTvProviders] = useState<PostpaidProvider[] | null>(null);
    const [tvProvidersLoading, setTvProvidersLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<PostpaidProvider | null>(null);
    const [plnCustomer, setPlnCustomer] = useState<PlnCustomer | null>(null);

    useEffect(() => {
        if (selected?.type !== 'tv') {
            setTvProviders(null);
            setTvProvidersLoading(false);
            setSelectedProvider(null);
            return;
        }
        let cancelled = false;
        setTvProvidersLoading(true);
        Promise.all([
            fetch('/ppob/pricelist-pasca/tv').then(r => r.json()),
            fetch('/ppob/pricelist-pasca/internet').then(r => r.json()),
        ])
            .then(([tv, internet]) => {
                if (!cancelled) {
                    const combined: PostpaidProvider[] = [
                        ...(tv?.data?.pasca ?? []),
                        ...(internet?.data?.pasca ?? []),
                    ];
                    setTvProviders(combined);
                    setTvProvidersLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setTvProviders([]);
                    setTvProvidersLoading(false);
                }
            });
        return () => { cancelled = true; };
    }, [selected?.type]);

    const handleSelect = (service: Service) => {
        if (selected?.label === service.label) {
            setSelected(null);
            setPrepaidService(null);
        } else {
            setSelected(service);
            setPrepaidService(null);
        }
        setPhoneNumber('');
        setOperator(null);
        setEmoneyProvider('');
        setIsValid(null);
        setBillData(null);
        setSelectedProvider(null);
        setPlnCustomer(null);
    };

    const handleServiceCheck = async () => {
        if (!selected) return;
        setIsLoading(true);
        setPrepaidService(null);
        setBillData(null);

        try {
            if (selected.type === 'pln_pasca' || selected.type === 'tv') {
                const isTv = selected.type === 'tv';
                if (isTv && !selectedProvider) return;
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
                const iakType = isTv
                    ? (selectedProvider!.type === 'internet' ? 'internet_pasca' : 'tv_pasca')
                    : 'pln_pasca';
                const res = await fetch('/ppob/inquiry', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        customer_id: phoneNumber,
                        product_code: isTv ? selectedProvider!.code : 'PLNPOSTPAID',
                        type: iakType,
                    }),
                });
                if (!res.ok) return;
                const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : null;
                if (data) setBillData(data);
            } else {
                const url = `/ppob/pricelist/${selected.type}`;
                const res = await fetch(url);
                const data = await res.json();
                const allItems: PricelistItem[] = data?.data?.pricelist ?? [];
                const isEmoney = selected?.type === 'etoll';
                const filterKey = isEmoney
                    ? emoneyProvider
                    : operator?.apiName ?? '';
                if (filterKey) {
                    const keyLower = filterKey.toLowerCase();
                    const isPulsa = selected?.type === 'pulsa';
                    const filtered = allItems
                        .filter(item => {
                            const desc = item.product_description.toLowerCase();
                            const code = item.product_code.toLowerCase();
                            if (!desc.includes(keyLower) && !code.includes(keyLower)) return false;
                            if (isPulsa) {
                                const nom = parseInt(item.product_nominal?.replace(/\D/g, '') ?? '');
                                if (isNaN(nom) || nom < 1000) return false;
                            }
                            return true;
                        })
                        .sort((a, b) => a.product_price - b.product_price);
                    setPrepaidService(filtered);
                } else {
                    if (selected.type === 'pln' && selected.endpoint === 'prepaid') {
                        if (!phoneNumber) {
                            setPrepaidService([]);
                        } else {
                            setPrepaidService([...allItems].sort((a, b) => a.product_price - b.product_price));
                            try {
                                const plnRes = await fetch(`/ppob/inquiry-pln/${encodeURIComponent(phoneNumber)}`);
                                if (plnRes.ok) setPlnCustomer(await plnRes.json());
                            } catch { /* graceful fallback */ }
                        }
                    } else if (operator) {
                        const opName = operator.apiName.toLowerCase();
                        setPrepaidService(
                            allItems
                                .filter(item => {
                                    const desc = item.product_description.toLowerCase();
                                    return desc.includes(opName) || opName.includes(desc);
                                })
                                .sort((a, b) => a.product_price - b.product_price)
                        );
                    } else {
                        setPrepaidService([]);
                    }
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhoneNumber(value);

        if ((selected?.type === 'pln' && selected?.endpoint === 'prepaid') || selected?.type === 'pln_pasca') {
            setIsValid(value.length === 0 ? null : value.length >= 11 && value.length <= 12);
            return;
        }

        if (selected?.type === 'tv') {
            setIsValid(value.length === 0 ? null : value.length >= 4);
            return;
        }

        const isPhoneService = selected?.type === 'pulsa' || selected?.type === 'data';
        if (!isPhoneService) { setIsValid(null); return; }

        if (value.length < 4) { setOperator(null); setIsValid(null); return; }
        const prefix = value.slice(0, 4);
        const match = Object.entries(phonePrefix).find(([, data]) =>
            (data as { prefixes: string[] }).prefixes.includes(prefix)
        );
        setOperator(match ? {
            name: match[0],
            image: (match[1] as { image: string }).image,
            apiName: (match[1] as { apiName: string }).apiName,
        } : null);
        setIsValid(value.length >= 10 ? /^08\d{8,11}$/.test(value) : null);
    };

    const serviceLabel = selected?.type === 'tv'
        ? (selectedProvider?.name ?? selected?.label)
        : selected?.label;

    return (
        <>
            <Head title="Layanan PPOB" />

            {isLoading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-bright/80 backdrop-blur-sm">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
                    <p className="mt-4 text-sm font-medium text-primary">Memuat produk...</p>
                </div>
            )}

            <Navbar balance={balance} />

            <div className="min-h-screen bg-surface-bright pt-[68px] pb-28">

                {/* Hero */}
                <section className="mx-auto max-w-7xl px-6 pb-8 pt-12">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-xs font-medium text-primary">Payment Point Online Bank</span>
                    </div>
                    <h1 className="font-headline mt-4 max-w-xl text-3xl font-extrabold leading-snug text-on-surface sm:text-4xl">
                        Layanan pembayaran<br />
                        <span className="text-primary">digital terpercaya.</span>
                    </h1>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-on-surface-variant">
                        Tersedia {services.length} kategori layanan PPOB yang bisa kamu akses kapan saja dan di mana saja dengan aman dan cepat.
                    </p>
                </section>

                {/* Digital Services */}
                <section className="mx-auto max-w-7xl px-6 pb-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="font-headline text-xl font-bold text-on-surface">Digital Services</h2>
                        <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-primary">
                            {services.length} layanan
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {services.map((s) => (
                            <ServiceCard
                                key={s.label}
                                service={s}
                                isSelected={selected?.label === s.label}
                                onClick={() => handleSelect(s)}
                            />
                        ))}
                    </div>
                </section>

                {/* Service Detail Panel */}
                {selected && (
                    <ServiceDetailPanel
                        service={selected}
                        onBack={() => handleSelect(selected)}
                        sidebar={
                            <>
                                {selected.type === 'tv' && (
                                    tvProvidersLoading ? (
                                        <div className="flex items-center gap-3 text-sm text-primary">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
                                            Memuat penyedia layanan...
                                        </div>
                                    ) : (
                                        <ProviderSelector
                                            providers={tvProviders ?? []}
                                            selected={selectedProvider?.code ?? null}
                                            onSelect={setSelectedProvider}
                                        />
                                    )
                                )}
                                {(selected.type !== 'tv' || selectedProvider !== null) && (
                                    <div className={selected.type === 'tv' ? 'mt-6' : ''}>
                                        <NumberInputBar
                                            value={phoneNumber}
                                            placeholder={selected.placeholder}
                                            isValid={isValid}
                                            onChange={handlePhoneNumberChange}
                                            onCheck={handleServiceCheck}
                                            operator={(selected.type === 'pulsa' || selected.type === 'data') ? operator : undefined}
                                            buttonLabel={
                                                selected.type === 'pln' && selected.endpoint === 'prepaid' ? 'Cek Token' :
                                                selected.type === 'pln_pasca' || selected.type === 'tv' ? 'Cek Tagihan' : 'Cek Layanan'
                                            }
                                            type={selected.type}
                                            emoneyProvider={emoneyProvider}
                                            onEmoneyChange={setEmoneyProvider}
                                        />
                                    </div>
                                )}
                            </>
                        }
                        content={
                            <>
                                {!billData && prepaidService === null && (
                                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 py-16 text-center">
                                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container">
                                            <selected.icon className="size-7 text-on-surface-variant" />
                                        </div>
                                        <p className="text-sm font-semibold text-on-surface">Siap melayani</p>
                                        <p className="mt-1 max-w-xs text-xs text-on-surface-variant">
                                            Masukkan nomor di sebelah kiri lalu klik tombol cek untuk melihat produk atau tagihan.
                                        </p>
                                    </div>
                                )}
                                {billData && (
                                    <BillInquiryCard
                                        bill={billData}
                                        customerNumber={phoneNumber}
                                        serviceType={selected.type}
                                        serviceLabel={serviceLabel}
                                        onPay={(bill) => setConfirmBill(bill)}
                                    />
                                )}
                                {prepaidService !== null && (
                                    <ProductList
                                        items={prepaidService}
                                        selected={selected}
                                        operator={operator}
                                        onBuy={setConfirmItem}
                                        customerNumber={phoneNumber}
                                        plnCustomer={plnCustomer}
                                    />
                                )}
                            </>
                        }
                    />
                )}

                <BottomNav active="beranda" />
            </div>

            <ConfirmModal
                show={confirmItem !== null}
                item={confirmItem}
                phoneNumber={phoneNumber}
                operator={operator}
                service={selected}
                onClose={() => setConfirmItem(null)}
            />

            <ConfirmModal
                show={confirmBill !== null}
                bill={confirmBill}
                serviceType={selected?.type}
                serviceLabel={serviceLabel}
                onClose={() => setConfirmBill(null)}
            />
        </>
    );
}
