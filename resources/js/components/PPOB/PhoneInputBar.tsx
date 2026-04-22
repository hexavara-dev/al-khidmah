import type { Operator } from '@/types/PPOB';

type Props = {
    phoneNumber: string;
    operator: Operator | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheck: () => void;
};

export default function PhoneInputBar({ phoneNumber, operator, onChange, onCheck }: Props) {
    return (
        <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white px-5 py-3 shadow-sm">
                <input
                    type="number"
                    value={phoneNumber}
                    onChange={onChange}
                    placeholder="Masukkan nomor HP"
                    className="w-72 border-none bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                {operator && (
                    <>
                        <div className="h-5 w-px bg-green-200" />
                        <div className="flex items-center gap-2">
                            <img src={operator.image} alt={operator.name} className="h-6 w-auto object-contain" />
                            <span className="text-sm font-medium capitalize text-green-700">{operator.name}</span>
                        </div>
                    </>
                )}
                <div className="h-5 w-px bg-green-200" />
                <button
                    onClick={onCheck}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                    Cek Layanan
                </button>
            </div>
        </div>
    );
}
