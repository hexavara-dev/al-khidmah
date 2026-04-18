import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, X, ShieldCheck } from 'lucide-react';
import Modal from '@/components/Modal';
import type { PricelistItem, Operator, Service, PostpaidBill } from '@/types/ppob';
import { idr, getItemTitle } from '@/lib/ppob';

type Status = 'idle' | 'loading' | 'success' | 'error';
type InquiryState = 'idle' | 'loading' | 'verified' | 'failed';

type Props = {
	show: boolean;
	item?: PricelistItem | null;
	phoneNumber?: string;
	operator?: Operator | null;
	service?: Service | null;
	bill?: PostpaidBill | null;
	serviceType?: string;
	serviceLabel?: string;
	onClose: () => void;
};


export default function ConfirmModal({ show, item, phoneNumber, operator, service, bill, serviceType, serviceLabel, onClose }: Props) {

  function isOvoProduct(item: PricelistItem | null): boolean {
    if (!item) return false;
    const code = item.product_code.toLowerCase();
    const desc = item.product_description.toLowerCase();
    return code.includes('ovo') || desc.includes('ovo');
  }

	const [status, setStatus] = useState<Status>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const [inquiryState, setInquiryState] = useState<InquiryState>('idle');
	const [ovoName, setOvoName] = useState('');
	const [inquiryError, setInquiryError] = useState('');

	const needsInquiry = isOvoProduct(item);

	useEffect(() => {
		if (!show) {
			setInquiryState('idle');
			setOvoName('');
			setInquiryError('');
		}
	}, [show]);

	const handleInquiry = async () => {
		setInquiryState('loading');
		setInquiryError('');
		try {
			const csrfMeta = document.querySelector('meta[name="csrf-token"]');
			const csrfToken = csrfMeta ? (csrfMeta as HTMLMetaElement).content : '';

			const res = await fetch('/ppob/inquiry-ovo', {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
					'X-CSRF-TOKEN': csrfToken,
				},
				body: JSON.stringify({ customer_id: phoneNumber }),
			});

			const data = await res.json();
			if (!res.ok || !data.success) {
				setInquiryError(data.message ?? 'Nomor OVO tidak valid.');
				setInquiryState('failed');
				return;
			}

			setOvoName(data.name ?? '-');
			setInquiryState('verified');
		} catch {
			setInquiryError('Gagal memverifikasi nomor OVO. Cek koneksi internet.');
			setInquiryState('failed');
		}
	};

	const isPostpaid = !!bill;

	const handleClose = () => {
		if (status === 'loading') return;
		setStatus('idle');
		setErrorMessage('');
		onClose();
	};

	const handleBuy = async () => {
		if (!isPostpaid && !item) return;
		setStatus('loading');
		setErrorMessage('');

		try {
			const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

			const endpoint = isPostpaid ? '/ppob/checkout-pasca' : '/ppob/checkout';
			const body = isPostpaid
				? { ref_id: bill!.ref_id }
				: { customer_id: phoneNumber, product_code: item!.product_code, type: service?.type ?? '', price: item!.product_price };

			const res = await fetch(endpoint, {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
					'X-CSRF-TOKEN': csrfToken,
				},
				body: JSON.stringify(body),
			});

			const contentType = res.headers.get('content-type') ?? '';
			const data = contentType.includes('application/json') ? await res.json() : null;

			if (!res.ok) {
				if (res.status === 419) {
					setErrorMessage('Sesi keamanan berakhir. Silakan refresh halaman lalu coba lagi.');
					setStatus('error');
					return;
				}
				setErrorMessage(data?.message ?? 'Transaksi gagal. Silakan coba lagi.');
				setStatus('error');
				return;
			}

			window.location.href = data.redirect_url;
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan. Silakan coba lagi.');
			setStatus('error');
		}
	};

	if (!isPostpaid && !item) return null;

	return (
		<Modal show={show} maxWidth="sm" onClose={handleClose}>
			<div className="p-6">
				<div className="mb-5 flex items-center justify-between">
					<h3 className="text-base font-semibold text-gray-900">
						{status === 'success' ? 'Transaksi Berhasil' : status === 'error' ? 'Transaksi Gagal' : 'Konfirmasi Pembelian'}
					</h3>
					{status !== 'loading' && (
						<button onClick={handleClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
							<X className="size-4" />
						</button>
					)}
				</div>

				{status === 'success' && (
					<div className="flex flex-col items-center gap-3 py-4 text-center">
						<CheckCircle2 className="size-14 text-green-500" />
						<p className="text-sm font-medium text-gray-700">
							{isPostpaid
								? <>Tagihan {serviceLabel ?? 'postpaid'} atas nama <span className="font-semibold text-green-700">{bill!.customer_name ?? phoneNumber}</span> sedang diproses.</>
								: <>Pembelian <span className="font-semibold text-green-700">{item ? getItemTitle(item, service?.type ?? '') : ''}</span> untuk nomor <span className="font-semibold">{phoneNumber}</span> sedang diproses.</>
							}
						</p>
						<button
							onClick={handleClose}
							className="mt-2 w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
						>
							Selesai
						</button>
					</div>
				)}

				{status === 'error' && (
					<div className="flex flex-col items-center gap-3 py-4 text-center">
						<XCircle className="size-14 text-red-500" />
						<p className="text-sm text-gray-600">{errorMessage}</p>
						<div className="mt-2 flex w-full gap-3">
							<button
								onClick={handleClose}
								className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
							>
								Tutup
							</button>
							<button
								onClick={() => setStatus('idle')}
								className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
							>
								Coba Lagi
							</button>
						</div>
					</div>
				)}

				{(status === 'idle' || status === 'loading') && (
					<>
						<div className="mb-5 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50 text-sm">
							{isPostpaid ? (
								<>
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-gray-500">Layanan</span>
										<span className="font-medium text-gray-800">
											{serviceLabel ?? (serviceType === 'tv' || serviceType === 'tv_pasca' || serviceType === 'internet_pasca' ? 'TV / Internet' : 'PLN Pascabayar')}
										</span>
									</div>
									{bill!.customer_name && (
										<div className="flex items-center justify-between px-4 py-3">
											<span className="text-gray-500">Nama Pelanggan</span>
											<span className="font-semibold text-gray-900">{bill!.customer_name}</span>
										</div>
									)}
									{bill!.period && (
										<div className="flex items-center justify-between px-4 py-3">
											<span className="text-gray-500">Periode</span>
											<span className="font-medium text-gray-800">{bill!.period}</span>
										</div>
									)}
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-gray-500">Tagihan</span>
										<span className="font-medium text-gray-800">{idr.format(bill!.nominal)}</span>
									</div>
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-gray-500">Admin</span>
										<span className="font-medium text-gray-800">{idr.format(bill!.admin)}</span>
									</div>
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-gray-500">Total Bayar</span>
										<span className="text-base font-bold text-green-600">{idr.format(bill!.price)}</span>
									</div>
								</>
							) : (
								<>
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-gray-500">Layanan</span>
										<span className="font-medium text-gray-800">{service?.label}</span>
									</div>
									{operator && (
										<div className="flex items-center justify-between px-4 py-3">
											<span className="text-gray-500">Operator</span>
											<div className="flex items-center gap-2">
												<img src={operator.image} alt={operator.name} className="h-5 w-auto object-contain" />
												<span className="font-medium capitalize text-gray-800">{operator.name}</span>
											</div>
										</div>
									)}
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-gray-500">{service?.type === 'pln' ? 'Nomor Meter' : 'Nomor Tujuan'}</span>
										<span className="font-semibold text-gray-900">{phoneNumber}</span>
									</div>
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-gray-500">Produk</span>
										<span className="font-medium text-gray-800">{item ? getItemTitle(item, service?.type ?? '') : ''}</span>
									</div>
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-gray-500">Total Bayar</span>
										<span className="text-base font-bold text-green-600">{idr.format(item?.product_price ?? 0)}</span>
									</div>
								</>
							)}
						</div>

						{/* OVO Inquiry Section */}
						{needsInquiry && inquiryState !== 'verified' && (
							<div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
								<p className="mb-3 text-xs text-amber-700">
									Untuk top-up OVO, nomor harus diverifikasi terlebih dahulu.
								</p>
								{inquiryState === 'failed' && (
									<p className="mb-3 text-xs font-medium text-red-600">{inquiryError}</p>
								)}
								<button
									onClick={handleInquiry}
									disabled={inquiryState === 'loading'}
									className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
								>
									{inquiryState === 'loading' ? 'Memverifikasi...' : inquiryState === 'failed' ? 'Coba Lagi' : 'Verifikasi Nomor OVO'}
								</button>
							</div>
						)}

						{needsInquiry && inquiryState === 'verified' && (
							<div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
								<ShieldCheck className="size-4 text-green-600" />
								<span className="text-sm text-green-700">
									Terverifikasi: <span className="font-semibold">{ovoName}</span>
								</span>
							</div>
						)}

						<div className="flex gap-3">
							<button
								onClick={handleClose}
								disabled={status === 'loading'}
								className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
							>
								Batal
							</button>
							<button
								onClick={handleBuy}
								disabled={status === 'loading' || (needsInquiry && inquiryState !== 'verified')}
								className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
							>
								{status === 'loading' ? 'Memproses...' : 'Konfirmasi'}
							</button>
						</div>
					</>
				)}
			</div>
		</Modal>
	);
}
