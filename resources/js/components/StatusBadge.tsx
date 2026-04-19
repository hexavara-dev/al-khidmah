interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        success: 'bg-blue-100 text-blue-700',
        failed:  'bg-red-100 text-red-700',
    };

    const labels: Record<string, string> = {
        pending: 'Pending',
        success: 'Sukses',
        failed:  'Gagal',
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {labels[status] ?? status}
        </span>
    );
}
