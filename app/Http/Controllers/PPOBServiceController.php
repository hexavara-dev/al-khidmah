<?php

namespace App\Http\Controllers;

use App\Models\PPOBService;
use App\Models\PPOBServiceProduct;
use App\Http\Requests\StorePPOBServiceRequest;
use App\Http\Requests\UpdatePPOBServiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PPOBServiceController extends Controller
{
    private const IAK_SUPPORTED = ['pulsa', 'data', 'pln', 'emoney', 'tv', 'listrik'];

    public function show(string $code, Request $request)
    {
        $service   = PPOBService::where('code', $code)->firstOrFail();
        $supported = in_array($code, self::IAK_SUPPORTED);

        $products = PPOBServiceProduct::where('ppob_service_id', $service->id)
            ->select(['id', 'code', 'name', 'label', 'price', 'base_price', 'period', 'status', 'fee', 'komisi'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/PPOB/ServicePage', [
            'service'   => $service,
            'supported' => $supported,
            'products'  => $products,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePPOBServiceRequest $request)
    {
        PPOBService::create($request->validated());

        return back()->with('success', 'Layanan berhasil ditambahkan.');
    }

    public function update(UpdatePPOBServiceRequest $request, PPOBService $ppobService)
    {
        $ppobService->update($request->validated());

        return back()->with('success', 'Layanan berhasil diperbarui.');
    }

    public function destroy(PPOBService $ppobService)
    {
        $ppobService->delete();

        return back()->with('success', 'Layanan berhasil dihapus.');
    }
}
