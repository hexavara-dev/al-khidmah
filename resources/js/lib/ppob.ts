import { Smartphone, Wifi, Tv2, Zap, Wallet, FileText } from 'lucide-react';
import type { Service, PricelistItem } from '@/types/ppob';

export const idr = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export const services: Service[] = [
    { label: 'Pulsa',                     sub: 'Prepaid Mobile',           type: 'pulsa',  endpoint: 'prepaid',  icon: Smartphone, placeholder: 'Masukkan nomor HP'           },
    { label: 'Paket Data',                sub: 'Internet',                 type: 'data',   endpoint: 'prepaid',  icon: Wifi,       placeholder: 'Masukkan nomor HP'           },
    { label: 'TV Kabel / Internet Rumah', sub: 'Berlangganan bulanan',     type: 'tv',     endpoint: 'postpaid', icon: Tv2,        placeholder: 'Masukkan nomor pelanggan'    },
    { label: 'Token Listrik',             sub: 'PLN Prepaid',              type: 'pln',    endpoint: 'prepaid',  icon: Zap,        placeholder: 'Masukkan nomor meter'        },
    { label: 'Top Up E-Money',            sub: 'OVO, GoPay, dan lainnya',  type: 'etoll',  endpoint: 'prepaid',  icon: Wallet,     placeholder: 'Masukkan nomor HP atau ID'   },
    { label: 'PLN Pascabayar',            sub: 'Tagihan listrik bulanan',  type: 'pln',    endpoint: 'postpaid', icon: FileText,   placeholder: 'Masukkan nomor meter'        },
];

export function getItemTitle(item: PricelistItem, serviceType: string): string {
    if (serviceType === 'pulsa') {
        const num = parseInt(item.product_nominal?.replace(/\D/g, '') ?? '');
        return isNaN(num) ? item.product_nominal : idr.format(num);
    }
    return item.product_nominal ?? item.product_code;
}

export function getItemSubtitle(item: PricelistItem, serviceType: string): string {
    if (serviceType === 'pulsa') return item.product_description;
    const nominal = item.product_nominal ?? '';
    const desc = item.product_description ?? '';
    return nominal.toLowerCase().startsWith(desc.toLowerCase())
        ? nominal.slice(desc.length).trim()
        : nominal;
}
