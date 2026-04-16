import { CheckCircle2, XCircle } from 'lucide-react';
import type { Operator } from '@/types/ppob';

type Props = {
    value: string;
    placeholder: string;
    isValid: boolean | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheck: () => void;
    operator?: Operator | null;
};

export default function NumberInputBar({ value, placeholder, isValid, onChange, onCheck, operator }: Props) {
    return (
        <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white px-5 py-3 shadow-sm">
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-72 border-none bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                {isValid !== null && (
                    <>
                        <div className="h-5 w-px bg-green-200" />
                        {isValid
                            ? <CheckCircle2 className="size-5 text-green-500" />
                            : <XCircle className="size-5 text-red-500" />
                        }
                    </>
                )}
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
