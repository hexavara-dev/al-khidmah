interface SnapResult {
    order_id: string;
    payment_type: string;
    transaction_status: string;
    fraud_status: string;
    va_numbers?: { bank: string; va_number: string }[];
    bank?: string;
    [key: string]: unknown;
}

interface Snap {
    pay: (
        token: string,
        options: {
            onSuccess?: (result: SnapResult) => void;
            onPending?: (result: SnapResult) => void;
            onError?:   (result: SnapResult) => void;
            onClose?:   () => void;
        }
    ) => void;
}

interface Window {
    snap: Snap;
}
