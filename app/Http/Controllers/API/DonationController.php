<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDonationRequest;
use App\Http\Requests\UpdateDonationStatusRequest;
use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;
use Midtrans\Notification;
use Midtrans\Transaction as MidtransTransaction;

class DonationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Donation::with(['user', 'campaign'])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('campaign', fn($c) => $c->where('title', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('month')) {
            [$year, $month] = explode('-', $request->month);
            $query->whereYear('created_at', $year)->whereMonth('created_at', $month);
        }

        $perPage = min((int) $request->input('per_page', 20), 100);
        $donations = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data donasi berhasil diambil.',
            'data' => $donations,
        ]);
    }

    public function myDonations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $donations = Donation::with('campaign')
            ->where('user_id', $userId)
            ->latest()
            ->paginate(10);

        $totalAmount = Donation::where('user_id', $userId)
            ->where('status', 'success')
            ->sum('amount');

        return response()->json([
            'success' => true,
            'message' => 'Riwayat donasi berhasil diambil.',
            'data' => $donations,
            'total_amount' => $totalAmount,
        ]);
    }

    /**
     * Resolve a human-identifiable payment_method string from Midtrans data.
     */
    private function resolvePaymentMethod(string $paymentType, $vaNumbers = null, ?string $bank = null, ?string $store = null): string
    {
        if ($paymentType === 'bank_transfer') {
            $bankName = null;
            if (!empty($vaNumbers)) {
                $first = is_array($vaNumbers) ? ($vaNumbers[0] ?? null) : null;
                $bankName = is_object($first) ? ($first->bank ?? null) : ($first['bank'] ?? null);
            }
            $bankName = $bankName ?? $bank;
            return $bankName ? strtolower($bankName) . '_va' : 'bank_transfer';
        }
        if ($paymentType === 'echannel')
            return 'mandiri_bill';
        if ($paymentType === 'cstore')
            return $store ? strtolower($store) : 'cstore';
        return $paymentType;
    }

    public function confirmPayment(Request $request, $id): JsonResponse
    {
        $donation = Donation::with('campaign')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($donation->status === 'pending') {
            $paymentType = $request->input('payment_type');
            $bank = $request->input('bank');
            $paymentMethod = $paymentType
                ? $this->resolvePaymentMethod($paymentType, null, $bank)
                : $donation->payment_method;

            DB::transaction(function () use ($donation, $paymentMethod) {
                $donation->update(['status' => 'success', 'payment_method' => $paymentMethod]);
                $donation->campaign->increment('collected_amount', $donation->amount);
            });
            $donation->refresh()->load('campaign');
        }

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

        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');

        try {
            $status = MidtransTransaction::status($donation->order_id);
            $transactionStatus = $status->transaction_status;
            $fraudStatus = $status->fraud_status ?? null;
            $paymentType = $status->payment_type ?? 'midtrans';
            $vaNumbers = $status->va_numbers ?? null;
            $bank = $status->bank ?? null;
            $store = $status->store ?? null;
            $paymentMethod = $this->resolvePaymentMethod($paymentType, $vaNumbers, $bank, $store);

            $newStatus = $donation->status;

            if (in_array($transactionStatus, ['capture', 'settlement'])) {
                $newStatus = ($fraudStatus === 'challenge') ? 'pending' : 'success';
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire', 'failure'])) {
                $newStatus = 'failed';
            } elseif ($transactionStatus === 'pending') {
                $newStatus = 'pending';
            }

            if ($newStatus !== $donation->status) {
                DB::transaction(function () use ($donation, $newStatus, $paymentMethod) {
                    $donation->update([
                        'status' => $newStatus,
                        'payment_method' => $paymentMethod,
                    ]);

                    if ($newStatus === 'success') {
                        $donation->campaign->increment('collected_amount', $donation->amount);
                    }
                });

                $donation->refresh()->load('campaign');
            }
        } catch (\Exception $e) {
            Log::error('Midtrans check payment error: ' . $e->getMessage());
            // Return current status even if check fails
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pembayaran diperbarui.',
            'data' => $donation,
        ]);
    }

    public function forCampaign(Campaign $campaign): JsonResponse
    {
        $donations = Donation::with('user')
            ->where('campaign_id', $campaign->id)
            ->where('status', 'success')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($d) {
                $isAnon = str_starts_with($d->note ?? '', '[Anonim]');
                $cleanNote = $isAnon ? trim(str_replace('[Anonim]', '', $d->note ?? '')) : ($d->note ?? '');
                return [
                    'id' => $d->id,
                    'amount' => $d->amount,
                    'note' => $cleanNote,
                    'created_at' => $d->created_at,
                    'donor_name' => $isAnon ? 'Hamba Allah' : ($d->user?->name ?? 'Hamba Allah'),
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Data donatur berhasil diambil.',
            'data' => $donations,
        ]);
    }

    public function store(StoreDonationRequest $request): JsonResponse
    {
        $campaign = Campaign::findOrFail($request->campaign_id);

        if (!$campaign->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign ini sudah tidak aktif.',
                'data' => null,
            ], 422);
        }

        // Configure Midtrans
        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized = true;
        MidtransConfig::$is3ds = true;

        $orderId = 'DON-' . time() . '-' . uniqid();

        $donation = DB::transaction(function () use ($request, $campaign, $orderId) {
            return Donation::create([
                'user_id' => $request->user()->id,
                'campaign_id' => $campaign->id,
                'amount' => $request->amount,
                'status' => 'pending',
                'payment_method' => 'midtrans',
                'note' => $request->note,
                'order_id' => $orderId,
            ]);
        });

        $donation->load(['user', 'campaign']);

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $donation->amount,
            ],
            'customer_details' => [
                'first_name' => $donation->user->name,
                'email' => $donation->user->email,
            ],
            'item_details' => [
                [
                    'id' => 'CAMP-' . $campaign->id,
                    'price' => (int) $donation->amount,
                    'quantity' => 1,
                    'name' => substr($campaign->title, 0, 50),
                ],
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
        } catch (\Exception $e) {
            Log::error('Midtrans Error: ' . $e->getMessage());
            $donation->delete();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungi payment gateway: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Donasi berhasil dibuat. Silakan selesaikan pembayaran.',
            'data' => $donation,
            'snap_token' => $snapToken,
            'client_key' => config('midtrans.client_key'),
        ], 201);
    }

    public function midtransWebhook(Request $request): JsonResponse
    {
        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');

        try {
            $notif = new Notification();

            $orderId = $notif->order_id;
            $transactionStatus = $notif->transaction_status;
            $fraudStatus = $notif->fraud_status;
            $paymentType = $notif->payment_type ?? 'midtrans';
            $vaNumbers = $notif->va_numbers ?? null;
            $bank = $notif->bank ?? null;
            $store = $notif->store ?? null;
            $paymentMethod = $this->resolvePaymentMethod($paymentType, $vaNumbers, $bank, $store);

            // Extract donation ID from order ID format: DON-{id}-{time}
            $parts = explode('-', $orderId);
            $donationId = $parts[1] ?? null;

            if (!$donationId) {
                return response()->json(['success' => false, 'message' => 'Invalid order ID.'], 400);
            }

            $donation = Donation::with('campaign')->find($donationId);
            if (!$donation) {
                return response()->json(['success' => false, 'message' => 'Donation not found.'], 404);
            }

            $newStatus = 'pending';
            if ($transactionStatus === 'capture' || $transactionStatus === 'settlement') {
                $newStatus = ($fraudStatus === 'challenge') ? 'pending' : 'success';
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
                $newStatus = 'failed';
            }

            DB::transaction(function () use ($donation, $newStatus, $paymentMethod) {
                $oldStatus = $donation->status;
                $donation->update(['status' => $newStatus, 'payment_method' => $paymentMethod]);

                if ($newStatus === 'success' && $oldStatus !== 'success') {
                    $donation->campaign->increment('collected_amount', $donation->amount);
                } elseif ($oldStatus === 'success' && $newStatus !== 'success') {
                    $donation->campaign->decrement('collected_amount', $donation->amount);
                }
            });

            return response()->json(['success' => true, 'message' => 'Webhook processed.']);
        } catch (\Exception $e) {
            Log::error('Midtrans Webhook Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(UpdateDonationStatusRequest $request, Donation $donation): JsonResponse
    {
        DB::transaction(function () use ($request, $donation) {
            $oldStatus = $donation->status;
            $newStatus = $request->status;

            $donation->update(['status' => $newStatus]);

            // Update collected_amount on campaign when status changes
            if ($newStatus === 'success' && $oldStatus !== 'success') {
                $donation->campaign->increment('collected_amount', $donation->amount);
            } elseif ($oldStatus === 'success' && $newStatus !== 'success') {
                $donation->campaign->decrement('collected_amount', $donation->amount);
            }
        });

        $donation->load(['user', 'campaign']);

        return response()->json([
            'success' => true,
            'message' => 'Status donasi berhasil diperbarui.',
            'data' => $donation,
        ]);
    }
}
