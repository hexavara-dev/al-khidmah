<?php

namespace App\Http\Controllers;

use App\Http\Requests\PPOB\InquiryRequest;
use App\Http\Requests\PPOB\PostpaidCheckoutRequest;
use App\Http\Requests\PPOB\PostpaidPriceListRequest;
use App\Http\Requests\PPOB\PriceListRequest;
use App\Http\Requests\PPOB\TopUpRequest;
use App\Models\PPOBService;
use App\Models\PPOBServiceProduct;
use App\Services\IAKService;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PPOBController extends Controller
{
    private const IAK_CONFIG = [
        'pulsa'  => ['iak_type' => 'pulsa', 'name_from' => 'details_or_nominal'],
        'data'   => ['iak_type' => 'data',  'name_from' => 'nominal'],
        'pln'    => ['iak_type' => 'pln',   'name_from' => 'nominal'],
        'emoney' => ['iak_type' => 'etoll', 'name_from' => 'nominal'],
    ];

    public function __construct(
        private IAKService $iakService,
        private TransactionService $transactionService,
    ) {}

    public function inquiryPln(string $hp): JsonResponse
    {
        $result = $this->iakService->inquiryPln($hp);
        $data   = $result['data'] ?? $result;
        $status = (int) ($data['status'] ?? 0);

        if ($status !== 1) {
            return response()->json(['message' => $data['message'] ?? 'Nomor meter tidak ditemukan.'], 422);
        }

        return response()->json([
            'name'          => $data['name']          ?? null,
            'meter_no'      => $data['meter_no']       ?? null,
            'segment_power' => $data['segment_power'] ?? null,
        ]);
    }

    public function checkBalance() {
        $result = $this->iakService->checkBalance();
        return response()->json($result);
    }

    public function priceList(PriceListRequest $request) {
        $type   = (string) $request->validated('type');
        $result = $this->iakService->priceList($type);
        return response()->json($result);
    }

    public function priceListPasca(PostpaidPriceListRequest $request) {
        $type   = (string) $request->validated('type');
        $result = $this->iakService->priceListPasca($type);
        return response()->json($result);
    }

    public function inquiryOvo(Request $request) {
        $request->validate([
            'customer_id' => 'required|string|regex:/^08\d{8,11}$/',
        ]);

        $result = $this->iakService->inquiryOvo($request->input('customer_id'));
        $data   = $result['data'] ?? [];

        if (($data['rc'] ?? '') !== '00') {
            return response()->json([
                'success' => false,
                'message' => $data['message'] ?? 'Nomor OVO tidak valid.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'name'    => $data['name'] ?? '-',
        ]);
    }

    public function checkout(TopUpRequest $request) {
        $data = $this->transactionService->createCheckout(
            customerId:  (string) $request->validated('customer_id'),
            productCode: (string) $request->validated('product_code'),
            type:        (string) $request->validated('type'),
            price:       (int)    $request->validated('price'),
        );

        return response()->json($data);
    }

    public function inquiry(InquiryRequest $request): JsonResponse
    {
        try {
            $data = $this->transactionService->createPostpaidInquiry(
                customerId:  (string) $request->validated('customer_id'),
                productCode: (string) $request->validated('product_code'),
                type:        (string) $request->validated('type'),
            );
            return response()->json($data);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function checkoutPasca(PostpaidCheckoutRequest $request): JsonResponse
    {
        $data = $this->transactionService->createPostpaidCheckout(
            refId: (string) $request->validated('ref_id'),
        );
        return response()->json($data);
    }

    public function callback(Request $request): Response
    {
        Log::info('IAK callback received', [
            'body'    => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        $data  = $request->input('data', []);
        $valid = $this->transactionService->handleIakCallback($data);

        if ($valid === false && empty($data['ref_id'])) {
            Log::warning('IAK callback rejected: missing ref_id', ['body' => $request->all()]);
            return response('Bad Request', 400);
        }

        if ($valid === false) {
            Log::warning('IAK callback rejected: invalid signature', ['data' => $data]);
            return response('Forbidden', 403);
        }

        Log::info('IAK callback processed successfully', ['ref_id' => $data['ref_id'] ?? null]);
        return response('OK', 200);
    }

    // ── Admin: product sync ──────────────────────────────────────────

    public function sync(string $code): JsonResponse
    {
        $config = self::IAK_CONFIG[$code] ?? null;

        if (! $config) {
            return response()->json(['error' => 'Layanan ini tidak mendukung sinkronisasi produk.'], 422);
        }

        $response = $this->iakService->priceList($config['iak_type']);
        $rawList  = $response['data']['pricelist'] ?? [];

        $items = collect($rawList)
            ->filter(fn ($item) => is_array($item) && ($item['status'] ?? '') === 'active')
            ->values()
            ->map(fn ($item) => $this->transform($item, $code, $config['name_from']))
            ->values();

        return response()->json(['data' => $items]);
    }

    public function store(Request $request, string $code): JsonResponse
    {
        $service = PPOBService::where('code', $code)->firstOrFail();

        $validated = $request->validate([
            'items'          => ['required', 'array', 'min:1'],
            'items.*.code'   => ['required', 'string', 'max:100'],
            'items.*.label'  => ['required', 'string', 'max:255'],
            'items.*.name'   => ['required', 'string'],
            'items.*.price'  => ['required', 'integer', 'min:0'],
            'items.*.period' => ['required', 'string', 'max:50'],
            'items.*.type'   => ['required', 'string', 'max:50'],
            'items.*.fee'    => ['nullable', 'integer', 'min:0'],
        ]);

        $saved = $this->upsert($service, $validated['items']);

        return response()->json([
            'saved'   => $saved,
            'message' => $saved . ' produk berhasil disimpan.',
        ]);
    }

    private function upsert(PPOBService $service, array $items): int
    {
        $now  = now();
        $rows = collect($items)->map(fn ($item) => [
            'id'              => (string) Str::uuid(),
            'ppob_service_id' => $service->id,
            'code'            => $item['code'],
            'label'           => $item['label'],
            'name'            => $item['name'],
            'price'           => $item['price'],
            'period'          => $item['period'],
            'type'            => $item['type'],
            'status'          => 1,
            'fee'             => $item['fee'] ?? null,
            'created_at'      => $now,
            'updated_at'      => $now,
        ])->toArray();

        PPOBServiceProduct::upsert(
            $rows,
            ['code'],
            ['label', 'name', 'price', 'period', 'type', 'fee', 'status', 'updated_at']
        );

        return count($rows);
    }

    private function transform(array $item, string $code, string $nameFrom): array
    {
        if ($nameFrom === 'details_or_nominal') {
            $details = trim((string) ($item['product_details'] ?? '-'));
            $name    = ($details !== '' && $details !== '-')
                ? $details
                : ($item['product_nominal'] ?? '');
        } else {
            $name = $item['product_nominal'] ?? '';
        }

        return [
            'code'   => $item['product_code']        ?? '',
            'label'  => $item['product_description'] ?? '',
            'name'   => $name,
            'price'  => (int) ($item['product_price']  ?? 0),
            'period' => (string) ($item['active_period'] ?? '0'),
            'type'   => $item['product_type']        ?? '',
            'fee'    => null,
        ];
    }
}

