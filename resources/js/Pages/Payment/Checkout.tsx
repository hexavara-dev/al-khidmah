import { router } from "@inertiajs/react";

interface Props {
    snapToken: string;
    clientKey: string;
    snapJsUrl: string;
}

export default function OrderSummary({ snapToken, clientKey, snapJsUrl }: Props) {
    const handlePay = () => {
        const script = document.createElement('script');
        script.src = snapJsUrl;
        script.setAttribute('data-client-key', clientKey);
        script.onload = () => {
            window.snap.pay(snapToken, {
                onSuccess: (result) => {
                    router.visit('/orders/' + result.order_id);
                },
                onPending: () => {
                    router.visit('/orders/pending');
                },
                onError: () => {
                    alert('Pembayaran gagal');
                },
            });
        };
        document.body.appendChild(script);
    };

    return (
        <div>
            <h1>Order Summary</h1>
            <button onClick={handlePay}>Bayar Sekarang</button>
        </div>
    );
}
