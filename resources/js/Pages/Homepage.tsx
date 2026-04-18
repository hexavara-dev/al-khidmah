import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { CircleDollarSign } from 'lucide-react';
import type { PageProps } from '@/types';
import type { Service, PricelistItem, Operator, PostpaidBill, PostpaidProvider, PlnCustomer } from '@/types/ppob';
import { idr, services } from '@/lib/ppob';
import phonePrefix from '@/lib/phonePrefix';
import ServiceCard from '@/components/ppob/ServiceCard';
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
                const url = `/ppob/pricelist/${selected.type}`;
                const res = await fetch(url);
                const data = await res.json();
                const allItems: PricelistItem[] = data?.data?.pricelist ?? [];
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

    return (
        <>
            <Head title="Layanan PPOB" />

            {isLoading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
                    <p className="mt-4 text-sm font-medium text-green-700">Memuat produk...</p>
                </div>
            )}

            <div className="min-h-screen bg-green-50 font-sans">
                {/* Navbar */}
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

                {/* Hero */}
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

                {/* Service Cards */}
                <section className="mx-auto max-w-6xl px-6 pb-16">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-green-700">Layanan Tersedia</h2>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {services.length} layanan
                        </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {services.map((s, i) => (
                            <ServiceCard
                                key={s.label}
                                service={s}
                                index={i}
                                isSelected={selected?.label === s.label}
                                onClick={() => handleSelect(s)}
                            />
                        ))}
                    </div>
                    {selected?.type === 'tv' && (
                        tvProvidersLoading ? (
                            <div className="mt-6 flex items-center gap-3 py-6 text-sm text-green-700">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
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
                    {selected && (selected.type !== 'tv' || selectedProvider !== null) && (
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
                    )}
                </section>

                {billData && (
                    <BillInquiryCard
                        bill={billData}
                        customerNumber={phoneNumber}
                        serviceType={selected?.type}
                        serviceLabel={selected?.type === 'tv' ? (selectedProvider?.name ?? selected?.label) : selected?.label}
                        onPay={(bill) => setConfirmBill(bill)}
                    />
                )}

                {prepaidService !== null && (
                    <ProductList items={prepaidService} selected={selected} operator={operator} onBuy={setConfirmItem} customerNumber={phoneNumber} plnCustomer={plnCustomer} />
                )}

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
                    serviceLabel={selected?.type === 'tv' ? (selectedProvider?.name ?? selected?.label) : selected?.label}
                    onClose={() => setConfirmBill(null)}
                />

                {/* Footer */}
                <footer className="border-t border-green-100 bg-white py-6">
                    <p className="text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Al-Khidmah. Didukung oleh IAK PPOB.
                    </p>
                </footer>
            </div>
        </>
    );
}
