const fmt = (n) => Number(n).toLocaleString('id-ID');

export default function CampaignCard({ campaign }) {
    const progress = campaign.target_amount > 0
        ? Math.min(100, (campaign.collected_amount / campaign.target_amount) * 100)
        : 0;

    const daysLeft = Math.max(
        0,
        Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    );

    const isNearDeadline = daysLeft > 0 && daysLeft <= 7;
    const isFull = progress >= 100;

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100">
            {/* Image */}
            <div className="relative">
                {campaign.image ? (
                    <img
                        src={`/storage/${campaign.image}`}
                        alt={campaign.title}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-emerald-200 flex items-center justify-center text-5xl">
                        🕌
                    </div>
                )}
                {/* Days left badge */}
                {daysLeft > 0 && (
                    <span className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white shadow ${
                        isNearDeadline ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                        </svg>
                        {daysLeft} HARI LAGI
                    </span>
                )}
                {daysLeft === 0 && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-white shadow">
                        Berakhir
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {campaign.category && (
                    <span className="text-xs text-emerald-600 font-semibold mb-1">{campaign.category.name}</span>
                )}
                <h3 className="font-bold text-gray-800 text-sm mb-3 line-clamp-2 leading-snug flex-1">
                    {campaign.title}
                </h3>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                        className={`h-2 rounded-full transition-all ${
                            isFull ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Amounts */}
                <div className="flex justify-between items-start mb-3 text-xs">
                    <div>
                        <p className="text-gray-400 uppercase font-semibold tracking-wide text-[10px]">Terkumpul</p>
                        <p className="text-blue-600 font-bold text-sm">Rp {fmt(campaign.collected_amount)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 uppercase font-semibold tracking-wide text-[10px]">Target</p>
                        <p className="text-gray-600 font-semibold text-sm">Rp {fmt(campaign.target_amount)}</p>
                    </div>
                </div>

                {/* Donate Button */}
                <button
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isFull
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                    }`}
                    disabled={isFull}
                >
                    {isFull ? 'Target Tercapai' : 'Donasi Sekarang'}
                </button>
            </div>
        </div>
    );
}

