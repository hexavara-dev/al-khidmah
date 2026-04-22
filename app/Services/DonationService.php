<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DonationService
{
    public function __construct(
        private MidtransService $midtrans,
    ) {
    }

    public function list(Request $request): LengthAwarePaginator
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

        return $query->paginate($perPage);
    }

    public function myDonations(string $userId): array
    {
        $donations = Donation::with('campaign')
            ->where('user_id', $userId)
            ->latest()
            ->paginate(10);

        $totalAmount = Donation::where('user_id', $userId)
            ->where('status', 'success')
            ->sum('amount');

        return [
            'donations' => $donations,
            'total_amount' => $totalAmount,
        ];
    }

    public function resolvePaymentMethod(string $paymentType, $vaNumbers = null, ?string $bank = null, ?string $store = null): string
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

    public function confirmPayment(Donation $donation, ?string $paymentType = null, ?string $bank = null): Donation
    {
        if ($donation->status === 'pending') {
            $paymentMethod = $paymentType
                ? $this->resolvePaymentMethod($paymentType, null, $bank)
                : $donation->payment_method;

            DB::transaction(function () use ($donation, $paymentMethod) {
                $donation->update(['status' => 'success', 'payment_method' => $paymentMethod]);
                $donation->campaign->increment('collected_amount', $donation->amount);
            });
            $donation->refresh()->load('campaign');
        }

        return $donation;
    }

    public function checkPayment(Donation $donation): Donation
    {
        if (!$donation->order_id) {
            return $donation;
        }

        try {
            $status = $this->midtrans->getTransactionStatus($donation->order_id);

            $transactionStatus = $status->transaction_status;
            $fraudStatus = $status->fraud_status ?? null;
            $paymentType = $status->payment_type ?? 'midtrans';
            $vaNumbers = $status->va_numbers ?? null;
            $bank = $status->bank ?? null;
            $store = $status->store ?? null;
            $paymentMethod = $this->resolvePaymentMethod($paymentType, $vaNumbers, $bank, $store);

            $newStatus = $this->mapTransactionStatus($transactionStatus, $fraudStatus);

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
        }

        return $donation;
    }

    public function getDonorsForCampaign(Campaign $campaign): Collection
    {
        return Donation::with('user')
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
    }

    public function createDonation(array $donationData, Campaign $campaign, object $user): array
    {
        if (!$campaign->is_active) {
            throw new \Exception('Campaign ini sudah tidak aktif.');
        }

        // Tutup donasi jika melewati deadline
        if ($campaign->deadline && $campaign->deadline->isPast()) {
            throw new \Exception('Campaign ini sudah melewati tenggat waktu.');
        }

        $orderId = 'DON-' . time() . '-' . uniqid();

        $donation = DB::transaction(function () use ($donationData, $campaign, $user, $orderId) {
            return Donation::create([
                'user_id' => $user->id,
                'campaign_id' => $campaign->id,
                'amount' => $donationData['amount'],
                'status' => 'pending',
                'payment_method' => 'midtrans',
                'note' => $donationData['note'] ?? null,
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
                'first_name' => $user->name,
                'email' => $user->email,
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
            $snapToken = $this->midtrans->createSnapToken(
                $params['transaction_details'],
                $params['customer_details'],
                ['item_details' => $params['item_details']]
            );
        } catch (\Exception $e) {
            Log::error('Midtrans Error: ' . $e->getMessage());
            $donation->delete();
            throw $e;
        }

        return [
            'donation' => $donation,
            'snap_token' => $snapToken,
            'client_key' => $this->midtrans->getSnapClientKey(),
        ];
    }

    public function processWebhook(array $payload): void
    {
        $notif = $this->midtrans->parseWebhookNotification($payload);

        $orderId = $notif->order_id;
        $transactionStatus = $notif->transaction_status;
        $fraudStatus = $notif->fraud_status ?? null;
        $paymentType = $notif->payment_type ?? 'midtrans';
        $vaNumbers = $notif->va_numbers ?? null;
        $bank = $notif->bank ?? null;
        $store = $notif->store ?? null;
        $paymentMethod = $this->resolvePaymentMethod($paymentType, $vaNumbers, $bank, $store);

        $donation = Donation::with('campaign')
            ->where('order_id', $orderId)
            ->firstOrFail();

        $newStatus = $this->mapTransactionStatus($transactionStatus, $fraudStatus);

        DB::transaction(function () use ($donation, $newStatus, $paymentMethod) {
            $oldStatus = $donation->status;
            $donation->update(['status' => $newStatus, 'payment_method' => $paymentMethod]);

            if ($newStatus === 'success' && $oldStatus !== 'success') {
                $donation->campaign->increment('collected_amount', $donation->amount);
            } elseif ($oldStatus === 'success' && $newStatus !== 'success') {
                $donation->campaign->decrement('collected_amount', $donation->amount);
            }
        });
    }

    public function updateStatus(Donation $donation, string $newStatus): Donation
    {
        DB::transaction(function () use ($donation, $newStatus) {
            $oldStatus = $donation->status;
            $donation->update(['status' => $newStatus]);

            if ($newStatus === 'success' && $oldStatus !== 'success') {
                $donation->campaign->increment('collected_amount', $donation->amount);
            } elseif ($oldStatus === 'success' && $newStatus !== 'success') {
                $donation->campaign->decrement('collected_amount', $donation->amount);
            }
        });

        $donation->load(['user', 'campaign']);

        return $donation;
    }

    private function mapTransactionStatus(string $transactionStatus, ?string $fraudStatus): string
    {
        if (in_array($transactionStatus, ['capture', 'settlement'])) {
            return ($fraudStatus === 'challenge') ? 'pending' : 'success';
        }

        if (in_array($transactionStatus, ['deny', 'cancel', 'expire', 'failure'])) {
            return 'failed';
        }

        return 'pending';
    }
}
