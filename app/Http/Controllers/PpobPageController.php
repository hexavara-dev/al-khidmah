<?php

namespace App\Http\Controllers;

use App\Services\IAKService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PpobPageController extends Controller
{
    private const VALID_TYPES = ['pulsa', 'data', 'pln', 'pln_pasca', 'tv', 'etoll'];

    private IAKService $iakService;

    public function __construct(IAKService $iakService)
    {
        $this->iakService = $iakService;
    }

    public function show(Request $request, string $type): \Inertia\Response
    {
        if (!in_array($type, self::VALID_TYPES, true)) {
            abort(404);
        }

        $balance = null;
        try {
            $saldo   = $this->iakService->checkBalance();
            $balance = $saldo['data']['balance'] ?? null;
        } catch (ConnectionException $e) {
            Log::warning('IAK balance check failed: ' . $e->getMessage());
        }

        $recentTransactions = $request->user()
            ->transactions()
            ->where('type', $type)
            ->orderByDesc('created_at')
            ->take(3)
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'customer_id'    => $t->customer_id,
                'product_code'   => $t->product_code,
                'price'          => $t->price,
                'payment_status' => $t->payment_status,
                'status'         => $t->status,
                'created_at'     => $t->created_at->format('d M Y · H:i'),
            ])
            ->values()
            ->toArray();

        return Inertia::render('Ppob/ServicePage', [
            'serviceType'        => $type,
            'balance'            => $balance,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
