export default function Pagination({ meta, onPageChange }) {
    if (!meta || meta.last_page <= 1) return null;

    const current = meta.current_page;
    const last    = meta.last_page;

    // Build page number list with ellipsis
    const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
    let pages;
    if (last <= 7) {
        pages = range(1, last);
    } else if (current <= 4) {
        pages = [...range(1, 5), '...', last];
    } else if (current >= last - 3) {
        pages = [1, '...', ...range(last - 4, last)];
    } else {
        pages = [1, '...', ...range(current - 1, current + 1), '...', last];
    }

    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-gray-500">
                Menampilkan {meta.from ?? 0}–{meta.to ?? 0} dari {meta.total} data
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(current - 1)}
                    disabled={current === 1}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    ‹
                </button>
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                                p === current
                                    ? 'bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-sm'
                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    onClick={() => onPageChange(current + 1)}
                    disabled={current === last}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    ›
                </button>
            </div>
        </div>
    );
}
