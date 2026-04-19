<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Requests\UpdateCampaignRequest;
use App\Models\Campaign;
use App\Services\CampaignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function __construct(
        private CampaignService $campaignService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data campaign berhasil diambil.',
            'data' => $this->campaignService->list($request),
        ]);
    }

    public function store(StoreCampaignRequest $request): JsonResponse
    {
        $campaign = $this->campaignService->create(
            $request->validated(),
            $request->file('image'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Campaign berhasil ditambahkan.',
            'data' => $campaign,
        ], 201);
    }

    public function show(Campaign $campaign): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Data campaign berhasil diambil.',
            'data' => $this->campaignService->getDetail($campaign),
        ]);
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign): JsonResponse
    {
        $campaign = $this->campaignService->update(
            $campaign,
            $request->validated(),
            $request->file('image'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Campaign berhasil diperbarui.',
            'data' => $campaign,
        ]);
    }

    public function destroy(Campaign $campaign): JsonResponse
    {
        $this->campaignService->delete($campaign);

        return response()->json([
            'success' => true,
            'message' => 'Campaign berhasil dihapus.',
            'data' => null,
        ]);
    }
}
