<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Category;
use App\Models\Donation;
use App\Services\CampaignService;
use App\Services\DonationService;
use App\Services\MidtransService; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DonasiController extends Controller
{
    public function __construct(
        private CampaignService $campaignService,
        private DonationService $donationService,
        private MidtransService $midtransService,
    ) {}

    public function index(Request $request): Response
    {
        $campaigns = $this->campaignService->list($request);
        $categories = Category::withCount('campaigns')->get();

        $totalKontribusi = 0;
        if ($request->user()) {
            $totalKontribusi = Donation::where('user_id', $request->user()->id)
                ->where('status', 'success')
                ->sum('amount');
        }

        return Inertia::render('home/HomePage', [
            'campaigns' => $campaigns,
            'categories' => $categories,
            'totalKontribusi' => $totalKontribusi,
            'filters' => $request->only(['search', 'category_id', 'is_active']),
        ]);
    }

    public function show(Campaign $campaign): Response
    {
        $campaign = $this->campaignService->getDetail($campaign);
        $donors = $this->donationService->getDonorsForCampaign($campaign);

        return Inertia::render('campaign/CampaignDetailPage', [
            'campaign' => $campaign,
            'donors' => $donors,
            'midtrans' => [
                'snapJsUrl' => $this->midtransService->getSnapJsUrl(),
                'clientKey' => $this->midtransService->getSnapClientKey(),
            ],
        ]);
    }

    public function myDonations(Request $request): Response
    {
        $result = $this->donationService->myDonations($request->user()->id);

        return Inertia::render('campaign/MyDonationsPage', [
            'donations' => $result['donations'],
            'totalAmount' => $result['total_amount'],
        ]);
    }
}
