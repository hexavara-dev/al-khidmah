import { useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import Modal from '@/components/Modal';
import type { PricelistItem, Operator, Service } from '@/types/ppob';
import { idr, getItemTitle } from '@/lib/ppob';

type Status = 'idle' | 'loading' | 'success' | 'error';

type Props = {
	show: boolean;
	item: PricelistItem | null;
	phoneNumber: string;
	operator: Operator | null;
	service: Service | null;
	onClose: () => void;
};

export default function ConfirmModal({ show, item, phoneNumber, operator, service, onClose }: Props) {
	const [status, setStatus] = useState<Status>('idle');
	const [errorMessage, setErrorMessage] = useState('');

	const handleClose = () => {
		if (status === 'loading') return;
		setStatus('idle');
		setErrorMessage('');
		onClose();
	};

	const handleBuy = async () => {
		if (!item) return;
		setStatus('loading');
		setErrorMessage('');

		try {
			const csrfMeta = document.querySelector('meta[name="csrf-token"]');
			const csrfToken = csrfMeta ? (csrfMeta as HTMLMetaElement).content : '';

			const res = await fetch('/ppob/checkout', {
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
					product_code: item.product_code,
					type: service?.type ?? '',
					price: item.product_price,
				}),
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

			// Redirect ke halaman pembayaran Midtrans
			window.location.href = data.redirect_url;
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan. Silakan coba lagi.');
			setStatus('error');
		}
	};

	if (!item) return null;

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
							Pembelian <span className="font-semibold text-green-700">{getItemTitle(item, service?.type ?? '')}</span> untuk nomor <span className="font-semibold">{phoneNumber}</span> sedang diproses.
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
								<span className="text-gray-500">Nomor Tujuan</span>
								<span className="font-semibold text-gray-900">{phoneNumber}</span>
							</div>
							<div className="flex items-center justify-between px-4 py-3">
								<span className="text-gray-500">Produk</span>
								<span className="font-medium text-gray-800">{getItemTitle(item, service?.type ?? '')}</span>
							</div>
							<div className="flex items-center justify-between px-4 py-3">
								<span className="text-gray-500">Total Bayar</span>
								<span className="text-base font-bold text-green-600">{idr.format(item.product_price)}</span>
							</div>
						</div>

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
								disabled={status === 'loading'}
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
