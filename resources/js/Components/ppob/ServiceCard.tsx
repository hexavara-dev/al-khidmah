import type { Service } from '@/types/ppob';

type Props = {
    service: Service;
    index: number;
    isSelected: boolean;
    onClick: () => void;
};

export default function ServiceCard({ service, index, isSelected, onClick }: Props) {
    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer rounded-2xl border p-6 shadow-sm transition duration-200 ${
                isSelected
                    ? 'border-green-500 bg-white shadow-md ring-2 ring-green-200'
                    : 'border-green-100 bg-white hover:border-green-300 hover:shadow-md'
            }`}
        >
            <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition duration-200 ${
                    isSelected
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white'
                }`}>
                    <service.icon className="size-6" />
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition duration-200 ${
                    isSelected ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'
                }`}>
                    #{index + 1}
                </span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">{service.label}</h3>
            <p className="mt-1 text-sm text-gray-400">{service.sub}</p>
        </div>
    );
}
