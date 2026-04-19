<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $transactions = $request->user()
            ->transactions()
            ->latest()
            ->paginate(15)
            ->through(fn ($t) => [
                'id'             => $t->id,
                'ref_id'         => $t->ref_id,
                'product_code'   => $t->product_code,
                'customer_id'    => $t->customer_id,
                'customer_name'  => $t->customer_name,
                'type'           => $t->type,
                'price'          => $t->price,
                'status'         => $t->status,
                'payment_status' => $t->payment_status,
                'sn'             => $t->sn,
                'created_at'     => $t->created_at->format('d M Y, H:i'),
            ]);

        return Inertia::render('History', [
            'transactions' => $transactions,
        ]);
    }
}
