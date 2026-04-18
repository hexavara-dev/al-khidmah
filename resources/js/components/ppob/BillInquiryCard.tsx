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
        <section className="mx-auto max-w-3xl px-6 pb-20">
            <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <Icon className="size-4 text-green-600" />
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-green-700">
                    {title}
                </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
                <div className="divide-y divide-gray-100 text-sm">
                    <div className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-gray-500">{customerLabel}</span>
                        <span className="font-semibold text-gray-900">{customerNumber}</span>
                    </div>
                    {bill.customer_name && (
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <span className="text-gray-500">Nama Pelanggan</span>
                            <span className="font-semibold text-gray-900">{bill.customer_name}</span>
                        </div>
                    )}
                    {bill.period && (
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <span className="text-gray-500">Periode</span>
                            <span className="font-medium text-gray-800">{bill.period}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-gray-500">Tagihan</span>
                        <span className="font-medium text-gray-800">{idr.format(bill.nominal)}</span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-gray-500">Admin</span>
                        <span className="font-medium text-gray-800">{idr.format(bill.admin)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-green-50 px-5 py-3.5">
                        <span className="font-semibold text-gray-700">Total Bayar</span>
                        <span className="text-base font-bold text-green-600">{idr.format(bill.price)}</span>
                    </div>
                </div>

                <div className="border-t border-gray-100 p-4">
                    <button
                        onClick={() => onPay(bill)}
                        className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-[0.98]"
                    >
                        Bayar Sekarang
                    </button>
                </div>
            </div>
        </section>
    );
}
