<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Category;
use App\Models\Donation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReportService
{
    public function campaignPdf(Request $request): Response
    {
        $query = Campaign::with('category')->withCount('donations');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $campaigns = $query->latest()->get();
        $categories = Category::all();
        $filterLabel = 'Semua Kategori';

        if ($request->filled('category_id')) {
            $cat = $categories->firstWhere('id', $request->category_id);
            if ($cat) $filterLabel = $cat->name;
        }

        $totalTarget = $campaigns->sum('target_amount');
        $totalCollected = $campaigns->sum('collected_amount');

        $pdf = Pdf::loadView('reports.campaigns', compact(
            'campaigns',
            'filterLabel',
            'totalTarget',
            'totalCollected'
        ))->setPaper('a4', 'landscape');

        return $pdf->download('laporan-campaign-' . now()->format('Y-m-d') . '.pdf');
    }

    public function donationPdf(Request $request): Response
    {
        $query = Donation::with(['user', 'campaign'])->latest();

        if ($request->filled('month')) {
            [$year, $month] = explode('-', $request->month);
            $query->whereYear('created_at', $year)->whereMonth('created_at', $month);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $donations = $query->get();
        $filterMonth = $request->filled('month')
            ? \Carbon\Carbon::createFromFormat('Y-m', $request->month)->translatedFormat('F Y')
            : 'Semua Bulan';
        $filterStatus = $request->filled('status') ? ucfirst($request->status) : 'Semua Status';

        $totalAmount = $donations->where('status', 'success')->sum('amount');

        $pdf = Pdf::loadView('reports.donations', compact(
            'donations',
            'filterMonth',
            'filterStatus',
            'totalAmount'
        ))->setPaper('a4', 'landscape');

        return $pdf->download('laporan-donasi-' . now()->format('Y-m-d') . '.pdf');
    }
}
