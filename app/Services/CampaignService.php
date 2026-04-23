<?php

namespace App\Services;

use App\Models\Campaign;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CampaignService
{
    public function list(Request $request): LengthAwarePaginator
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

        return $query->latest()->paginate($perPage);
    }

    public function create(array $data, ?object $imageFile = null): Campaign
    {
        if ($imageFile) {
            $data['image'] = $imageFile->store('campaigns', 'public');
        }

        $campaign = Campaign::create($data);
        $campaign->load('category');

        return $campaign;
    }

    public function getDetail(Campaign $campaign): Campaign
    {
        $campaign->load('category');
        $campaign->loadCount('donations');

        return $campaign;
    }

    public function update(Campaign $campaign, array $data, ?object $imageFile = null): Campaign
    {
        if ($imageFile) {
            if ($campaign->image) {
                Storage::disk('public')->delete($campaign->image);
            }
            $data['image'] = $imageFile->store('campaigns', 'public');
        }

        $campaign->update($data);
        $campaign->load('category');

        return $campaign;
    }

    public function delete(Campaign $campaign): void
    {
        if ($campaign->image) {
            Storage::disk('public')->delete($campaign->image);
        }

        $campaign->delete();
    }
}
