export default function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-700',
        success: 'bg-blue-100 text-blue-700',
        failed:  'bg-red-100 text-red-700',
    };

    const labels = {
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
