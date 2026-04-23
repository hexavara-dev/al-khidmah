import type { Campaign } from '../types';

const fmt = (n: number) => Number(n).toLocaleString('id-ID');

interface CampaignCardProps {
    campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
    const hasTarget = campaign.target_amount != null && Number(campaign.target_amount) > 0;
    const progress = hasTarget
        ? Math.min(100, (campaign.collected_amount / campaign.target_amount) * 100)
        : 0;

    const daysLeft = Math.max(
        0,
        Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    const isNearDeadline = daysLeft > 0 && daysLeft <= 7;
    // Campaign dianggap tutup HANYA karena deadline habis, bukan karena target tercapai
    const isClosed = daysLeft === 0;

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
                    <div className="w-full h-48 bg-gradient-to-br from-[#00cacd]/10 to-emerald-200 flex items-center justify-center text-5xl">
                        🕌
                    </div>
                )}
                {/* Days left badge */}
                {daysLeft > 0 && (
                    <span className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white shadow ${
                        isNearDeadline ? 'bg-red-500' : 'bg-[#00cacd]'
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

                {/* Progress bar — hanya ditampilkan jika ada target */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                    {hasTarget && (
                        <div
                            className={`h-2 rounded-full transition-all ${
                                progress >= 100 ? 'bg-emerald-500' : 'bg-[#00cacd]'
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    )}
                </div>

                {/* Amounts */}
                <div className="flex justify-between items-start mb-3 text-xs">
                    <div>
                        <p className="text-gray-400 uppercase font-semibold tracking-wide text-[10px]">Terkumpul</p>
                        <p className="text-[#00cacd] font-bold text-sm">Rp {fmt(campaign.collected_amount)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 uppercase font-semibold tracking-wide text-[10px]">Target</p>
                        <p className="text-gray-600 font-semibold text-sm">
                            {hasTarget ? `Rp ${fmt(campaign.target_amount)}` : 'Tak Terbatas'}
                        </p>
                    </div>
                </div>

                {/* Donate Button */}
             <button
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isClosed
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#00cacd] hover:bg-[#00b8bb] text-white shadow-sm hover:shadow-md'
                }`}
                disabled={isClosed}
            >
                {isClosed ? 'Berakhir' : 'Donasi Sekarang'}
            </button>
            </div>
        </div>
    );
}

