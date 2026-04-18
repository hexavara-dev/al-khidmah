const fmt = (n) => Number(n).toLocaleString('id-ID');

export default function CampaignCard({ campaign }) {
    const progress = campaign.target_amount > 0
        ? Math.min(100, (campaign.collected_amount / campaign.target_amount) * 100)
        : 0;

    const daysLeft = Math.max(
        0,
        Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full border border-gray-100">
            <div className="relative">
                {campaign.image ? (
                    <img
                        src={`/storage/${campaign.image}`}
                        alt={campaign.title}
                        className="w-full h-44 object-cover"
                    />
                ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-blue-100 to-emerald-200 flex items-center justify-center text-5xl">
                        🕌
                    </div>
                )}
                {daysLeft > 0 && (
                    <span className={`absolute top-3 right-3 text-white text-xs px-2 py-0.5 rounded-full font-medium ${
                        daysLeft <= 7 ? 'bg-red-500' : 'bg-black/40'
                    }`}>
                        {daysLeft} hari lagi
                    </span>
                )}
            </div>
            <div className="p-4 flex flex-col flex-1">
                {campaign.category && (
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full w-fit mb-2">
                        {campaign.category.name}
                    </span>
                )}
                <h3 className="font-semibold text-gray-800 text-sm mb-3 line-clamp-2 flex-1">{campaign.title}</h3>
                <div className="mt-auto">
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                        <span>Terkumpul</span>
                        <span className="font-semibold text-emerald-600">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div
                            className="bg-gradient-to-r from-blue-400 to-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm font-bold text-gray-800">Rp {fmt(campaign.collected_amount)}</p>
                    <p className="text-xs text-gray-400 mb-3">dari Rp {fmt(campaign.target_amount)}</p>
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 rounded-xl text-center transition">
                        Donasi Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
}
