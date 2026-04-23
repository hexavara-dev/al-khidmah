<?php

namespace App\Http\Controllers;

use App\Models\PPOBService;
use App\Models\PPOBServiceCategory;
use App\Models\PPOBServiceProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PPOBServiceCategoryController extends Controller
{
    /**
     * List all categories (with product count) for a given service code.
     */
    public function index(string $code): JsonResponse
    {
        $service = PPOBService::where('code', $code)->firstOrFail();

        $categories = PPOBServiceCategory::where('ppob_id', $service->id)
            ->withCount('products')
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($categories);
    }

    /**
     * List products belonging to a specific category.
     */
    public function products(string $code, string $categoryId): JsonResponse
    {
        $service  = PPOBService::where('code', $code)->firstOrFail();
        $category = PPOBServiceCategory::where('id', $categoryId)
            ->where('ppob_id', $service->id)
            ->firstOrFail();

        $products = PPOBServiceProduct::where('category_id', $category->id)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'label', 'price', 'status']);

        return response()->json($products);
    }

    /**
     * Create a new category (name unique per service).
     */
    public function store(Request $request, string $code): JsonResponse
    {
        $service = PPOBService::where('code', $code)->firstOrFail();

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('ppob_service_categories', 'name')
                    ->where('ppob_id', $service->id),
            ],
        ]);

        $category = PPOBServiceCategory::create([
            'name'    => $data['name'],
            'ppob_id' => $service->id,
        ]);

        return response()->json($category->only(['id', 'name']), 201);
    }

    /**
     * Update a category's name (must remain unique per service).
     */
    public function update(Request $request, string $code, string $categoryId): JsonResponse
    {
        $service  = PPOBService::where('code', $code)->firstOrFail();
        $category = PPOBServiceCategory::where('id', $categoryId)
            ->where('ppob_id', $service->id)
            ->firstOrFail();

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('ppob_service_categories', 'name')
                    ->where('ppob_id', $service->id)
                    ->ignore($category->id),
            ],
        ]);

        $category->update(['name' => $data['name']]);

        return response()->json($category->only(['id', 'name']));
    }

    /**
     * Delete a category and nullify category_id on its products.
     */
    public function destroy(string $code, string $categoryId): JsonResponse
    {
        $service  = PPOBService::where('code', $code)->firstOrFail();
        $category = PPOBServiceCategory::where('id', $categoryId)
            ->where('ppob_id', $service->id)
            ->firstOrFail();

        PPOBServiceProduct::where('category_id', $category->id)
            ->update(['category_id' => null]);

        $category->delete();

        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}
