<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private ReportService $reportService,
    ) {}

    public function campaignPdf(Request $request)
    {
        return $this->reportService->campaignPdf($request);
    }

    public function donationPdf(Request $request)
    {
        return $this->reportService->donationPdf($request);
    }
}
