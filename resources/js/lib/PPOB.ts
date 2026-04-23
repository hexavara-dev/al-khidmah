import { Smartphone, Wifi, Tv2, Zap, Wallet, FileText } from 'lucide-react';
import type { Service, PricelistItem } from '@/types/PPOB';
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
    { label: 'PLN Pascabayar',            sub: 'Tagihan listrik bulanan',  type: 'pln_pasca', endpoint: 'postpaid', icon: FileText, placeholder: 'Masukkan nomor meter'        },
];

function parseEtollNominal(nominal: string): { nominalNum: number; adminNum: number } | null {
    const adminMatch = nominal.match(/Admin(?:\s+Rp)?\s*([\d.]+)/i);
    const nominalMatch = nominal.match(/(?:Rp\s*)?([\d.]+)/i);
    if (!nominalMatch) return null;
    const nominalNum = parseInt(nominalMatch[1].replace(/\./g, ''));
    const adminNum   = adminMatch ? parseInt(adminMatch[1].replace(/\./g, '')) : 0;
    return { nominalNum, adminNum };
}

export function getItemTitle(item: PricelistItem, serviceType: string): string {
    if (serviceType === 'pulsa') {
        const num = parseInt(item.product_nominal?.replace(/\D/g, '') ?? '');
        if (isNaN(num) || num < 1000) return item.product_nominal;
        return idr.format(num);
    }
    if (serviceType === 'etoll') {
        const parsed = parseEtollNominal(item.product_nominal ?? '');
        if (parsed && parsed.nominalNum >= 1000) {
            return `Saldo ${idr.format(parsed.nominalNum - parsed.adminNum)}`;
        }
        return item.product_description ?? item.product_nominal ?? item.product_code;
    }
    if (serviceType === 'pln') {
        return item.product_description ?? item.product_nominal ?? item.product_code;
    }
    return item.product_nominal ?? item.product_code;
}

export function getItemSubtitle(item: PricelistItem, serviceType: string): string {
    if (serviceType === 'pulsa') return item.product_description;
    if (serviceType === 'pln') return item.product_nominal ?? '';
    if (serviceType === 'pulsa') {
        const details = (item.product_details ?? '').trim();
        const nominal = parseInt(item.product_nominal?.replace(/\D/g, '') ?? '');

        // Masa aktif dari product_details ("masa aktif X hari" atau "X Hari" di akhir)
        const masaMatch = details.match(/(\d+)\s*hari/i);
        const masaStr = masaMatch ? `${masaMatch[1]} hari` : '';

        // Detect paket nelpon atau paket SMS
        const isNelpon = /nelpon|bicara|telepon|telp/i.test(details);
        const isSMS    = /\bSMS\b/i.test(details) && !/reguler/i.test(details);

        if (isNelpon) return masaStr ? `Paket Nelpon · ${masaStr}` : 'Paket Nelpon';
        if (isSMS)   return masaStr ? `Paket SMS · ${masaStr}` : 'Paket SMS';

        // Pulsa reguler — tampilkan markup harga
        if (!isNaN(nominal) && nominal > 0) {
            const markup = item.product_price - nominal;
            const markupStr = markup > 0 ? ` · +${idr.format(markup)}` : markup < 0 ? ` · hemat ${idr.format(-markup)}` : '';
            return `Reguler${masaStr ? ` · ${masaStr}` : ''}${markupStr}`;
        }
        return masaStr ? `Reguler · ${masaStr}` : 'Reguler';
    }
    if (serviceType === 'etoll') {
        const parsed = parseEtollNominal(item.product_nominal ?? '');
        if (!parsed || parsed.nominalNum < 1000) return `Bayar ${idr.format(item.product_price)}`;

        const saldoMasuk   = parsed.nominalNum - parsed.adminNum;
        const adminFee     = parsed.adminNum;
        const biayaLayanan = item.product_price - saldoMasuk - adminFee;

        const parts: string[] = [];
        if (adminFee > 0)     parts.push(`Admin e-wallet ${idr.format(adminFee)}`);
        if (biayaLayanan > 0) parts.push(`Biaya layanan ${idr.format(biayaLayanan)}`);
        if (parts.length === 0) return `Bayar ${idr.format(item.product_price)}`;

        return `${parts.join(' + ')} · bayar ${idr.format(item.product_price)}`;
    }
    const nominal = item.product_nominal ?? '';
    const desc = item.product_description ?? '';
    return nominal.toLowerCase().startsWith(desc.toLowerCase())
        ? nominal.slice(desc.length).trim()
        : nominal;
}
