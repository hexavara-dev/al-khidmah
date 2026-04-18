<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Requests\UpdateCampaignRequest;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Campaign::with('category')
            ->withCount('donations');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $perPage = min((int) $request->input('per_page', 12), 100);
        $campaigns = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data campaign berhasil diambil.',
            'data' => $campaigns,
        ]);
    }

    public function store(StoreCampaignRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('campaigns', 'public');
        }

        $campaign = Campaign::create($data);
        $campaign->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Campaign berhasil ditambahkan.',
            'data' => $campaign,
        ], 201);
    }

    public function show(Campaign $campaign): JsonResponse
    {
        $campaign->load('category');
        $campaign->loadCount('donations');

        return response()->json([
            'success' => true,
            'message' => 'Data campaign berhasil diambil.',
            'data' => $campaign,
        ]);
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($campaign->image) {
                Storage::disk('public')->delete($campaign->image);
            }
            $data['image'] = $request->file('image')->store('campaigns', 'public');
        }

        $campaign->update($data);
        $campaign->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Campaign berhasil diperbarui.',
            'data' => $campaign,
        ]);
    }

    public function destroy(Campaign $campaign): JsonResponse
    {
        if ($campaign->image) {
            Storage::disk('public')->delete($campaign->image);
        }

        $campaign->delete();

        return response()->json([
            'success' => true,
            'message' => 'Campaign berhasil dihapus.',
            'data' => null,
        ]);
    }
}
