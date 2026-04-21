<?php

namespace App\Http\Controllers;

use App\Models\PPOBService;
use App\Http\Requests\StorePPOBServiceRequest;
use App\Http\Requests\UpdatePPOBServiceRequest;
use Inertia\Inertia;

class PPOBServiceController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/PPOB/Index', [
            'services' => PPOBService::withCount('categories')
                ->with('categories')
                ->orderBy('description')
                ->get(),
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
