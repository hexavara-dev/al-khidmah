import { Zap, Tv2 } from 'lucide-react';
import type { PostpaidBill } from '@/types/ppob';
import { idr } from '@/lib/ppob';

type Props = {
    bill: PostpaidBill;
    customerNumber: string;
    serviceType?: string;
    serviceLabel?: string;
    onPay: (bill: PostpaidBill) => void;
};

export default function BillInquiryCard({ bill, customerNumber, serviceType = 'pln_pasca', serviceLabel, onPay }: Props) {
    const isTv = serviceType === 'tv' || serviceType === 'tv_pasca' || serviceType === 'internet_pasca';
    const Icon = isTv ? Tv2 : Zap;
    const title = `Detail Tagihan ${serviceLabel ?? (isTv ? 'TV / Internet' : 'PLN')}`;
    const customerLabel = isTv ? 'Nomor Pelanggan' : 'Nomor Meter';

    return (
        <div>
            <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container">
                    <Icon className="size-5 text-primary" />
                </div>
                <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-primary">
                    {title}
                </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
                <div className="divide-y divide-outline-variant/10 text-sm">
                    <div className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-on-surface-variant">{customerLabel}</span>
                        <span className="font-semibold text-on-surface">{customerNumber}</span>
                    </div>
                    {bill.customer_name && (
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <span className="text-on-surface-variant">Nama Pelanggan</span>
                            <span className="font-semibold text-on-surface">{bill.customer_name}</span>
                        </div>
                    )}
                    {bill.period && (
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <span className="text-on-surface-variant">Periode</span>
                            <span className="font-medium text-on-surface">{bill.period}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-on-surface-variant">Tagihan</span>
                        <span className="font-medium text-on-surface">{idr.format(bill.nominal)}</span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-on-surface-variant">Admin</span>
                        <span className="font-medium text-on-surface">{idr.format(bill.admin)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-primary-container px-5 py-3.5">
                        <span className="font-semibold text-on-primary-container">Total Bayar</span>
                        <span className="text-base font-bold text-primary">{idr.format(bill.price)}</span>
                    </div>
                </div>

                <div className="border-t border-outline-variant/10 p-4">
                    <button
                        onClick={() => onPay(bill)}
                        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-dim active:scale-[0.98]"
                    >
                        Bayar Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
}
