import type { Service } from '@/types/ppob';

type Props = {
    service: Service;
    isSelected: boolean;
    onClick: () => void;
};

export default function ServiceCard({ service, isSelected, onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className={`group flex flex-col items-center gap-2.5 rounded-3xl px-3 py-5 transition-all duration-200 active:scale-95 ${
                isSelected
                    ? 'bg-primary shadow-lg shadow-primary/25'
                    : 'bg-surface-container-low hover:bg-surface-container'
            }`}
        >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ${
                isSelected
                    ? 'bg-white/20'
                    : 'bg-surface-container-lowest shadow-sm group-hover:shadow-md'
            }`}>
                <service.icon className={`size-6 transition-colors ${isSelected ? 'text-white' : 'text-primary'}`} />
            </div>
            <span className={`text-center text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-on-surface'}`}>
                {service.label}
            </span>
        </button>
    );
}
