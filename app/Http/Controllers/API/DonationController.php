<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDonationRequest;
use App\Http\Requests\UpdateDonationStatusRequest;
use App\Models\Campaign;
use App\Models\Donation;
use App\Services\DonationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DonationController extends Controller
{
    public function __construct(
        private DonationService $donationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data donasi berhasil diambil.',
            'data' => $this->donationService->list($request),
        ]);
    }

    public function myDonations(Request $request): JsonResponse
    {
        $result = $this->donationService->myDonations($request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat donasi berhasil diambil.',
            'data' => $result['donations'],
            'total_amount' => $result['total_amount'],
        ]);
    }

    public function confirmPayment(Request $request, $id): JsonResponse
    {
        $donation = Donation::with('campaign')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $donation = $this->donationService->confirmPayment(
            $donation,
            $request->input('payment_type'),
            $request->input('bank'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Status donasi berhasil dikonfirmasi.',
            'data' => $donation,
        ]);
    }

    public function checkPayment(Request $request, $id): JsonResponse
    {
        $donation = Donation::with('campaign')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (!$donation->order_id) {
            return response()->json([
                'success' => false,
                'message' => 'Order ID tidak ditemukan.',
                'data' => $donation,
            ], 422);
        }

        $donation = $this->donationService->checkPayment($donation);

        return response()->json([
            'success' => true,
            'message' => 'Status pembayaran diperbarui.',
            'data' => $donation,
        ]);
    }

    public function forCampaign(Campaign $campaign): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data donatur berhasil diambil.',
            'data' => $this->donationService->getDonorsForCampaign($campaign),
        ]);
    }

    public function store(StoreDonationRequest $request): JsonResponse
    {
        $campaign = Campaign::findOrFail($request->campaign_id);

        try {
            $result = $this->donationService->createDonation(
                $request->validated(),
                $campaign,
                $request->user(),
            );
        } catch (\Exception $e) {
            if ($e->getMessage() === 'Campaign ini sudah tidak aktif.') {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'data' => null,
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungi payment gateway: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Donasi berhasil dibuat. Silakan selesaikan pembayaran.',
            'data' => $result['donation'],
            'snap_token' => $result['snap_token'],
            'client_key' => $result['client_key'],
        ], 201);
    }

    public function midtransWebhook(Request $request): JsonResponse
    {
        try {
            $this->donationService->processWebhook($request->all());

            return response()->json(['success' => true, 'message' => 'Webhook processed.']);
        } catch (\Exception $e) {
            Log::error('Midtrans Webhook Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(UpdateDonationStatusRequest $request, Donation $donation): JsonResponse
    {
        $donation = $this->donationService->updateStatus($donation, $request->status);

        return response()->json([
            'success' => true,
            'message' => 'Status donasi berhasil diperbarui.',
            'data' => $donation,
        ]);
    }
}
