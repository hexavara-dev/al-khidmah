<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan Campaign</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            color: #1f2937;
            background: #fff;
        }

        .header {
            background: linear-gradient(135deg, #1d4ed8, #059669);
            color: #fff;
            padding: 20px 24px;
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 18px;
            font-weight: bold;
        }

        .header p {
            font-size: 10px;
            opacity: 0.85;
            margin-top: 4px;
        }

        .meta {
            display: flex;
            gap: 16px;
            padding: 0 24px;
            margin-bottom: 16px;
        }

        .meta-card {
            background: #f0fdf4;
            border: 1px solid #d1fae5;
            border-radius: 8px;
            padding: 10px 16px;
            flex: 1;
        }

        .meta-card .label {
            font-size: 9px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .meta-card .value {
            font-size: 14px;
            font-weight: bold;
            color: #1d4ed8;
            margin-top: 2px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 0 24px;
            width: calc(100% - 48px);
        }

        thead tr {
            background: #1d4ed8;
            color: #fff;
        }

        thead th {
            padding: 9px 10px;
            text-align: left;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        tbody tr:nth-child(odd) {
            background: #ffffff;
        }

        tbody td {
            padding: 8px 10px;
            border-bottom: 1px solid #f3f4f6;
        }

        .progress-bar-bg {
            background: #e5e7eb;
            border-radius: 4px;
            height: 6px;
            width: 100%;
        }

        .progress-bar {
            background: #10b981;
            height: 6px;
            border-radius: 4px;
        }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 9px;
            font-weight: 600;
        }

        .badge-active {
            background: #dcfce7;
            color: #16a34a;
        }

        .badge-inactive {
            background: #fee2e2;
            color: #dc2626;
        }

        .footer {
            text-align: right;
            font-size: 9px;
            color: #9ca3af;
            padding: 12px 24px 0;
            margin-top: 12px;
            border-top: 1px solid #e5e7eb;
        }

        .amount {
            font-weight: 600;
            color: #1d4ed8;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>🕌 Laporan Campaign — {{ $filterLabel }}</h1>
        <p>Dicetak pada {{ now()->format('d F Y, H:i') }} WIB &bull; Donasi Al-Khidmah</p>
    </div>

    <div class="meta">
        <div class="meta-card">
            <div class="label">Total Campaign</div>
            <div class="value">{{ $campaigns->count() }}</div>
        </div>
        <div class="meta-card">
            <div class="label">Total Target</div>
            <div class="value">Rp {{ number_format($totalTarget, 0, ',', '.') }}</div>
        </div>
        <div class="meta-card">
            <div class="label">Total Terkumpul</div>
            <div class="value">Rp {{ number_format($totalCollected, 0, ',', '.') }}</div>
        </div>
        <div class="meta-card">
            <div class="label">Progres Keseluruhan</div>
            <div class="value">{{ $totalTarget > 0 ? number_format(($totalCollected / $totalTarget) * 100, 1) : 0 }}%
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:4%">#</th>
                <th style="width:26%">Judul Campaign</th>
                <th style="width:12%">Kategori</th>
                <th style="width:14%">Target</th>
                <th style="width:14%">Terkumpul</th>
                <th style="width:14%">Progres</th>
                <th style="width:8%">Donatur</th>
                <th style="width:9%">Deadline</th>
                <th style="width:9%">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($campaigns as $i => $c)
                @php
                    $prog = $c->target_amount > 0 ? min(100, ($c->collected_amount / $c->target_amount) * 100) : 0;
                @endphp
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $c->title }}</td>
                    <td>{{ $c->category?->name ?? '-' }}</td>
                    <td class="amount">Rp {{ number_format($c->target_amount, 0, ',', '.') }}</td>
                    <td class="amount">Rp {{ number_format($c->collected_amount, 0, ',', '.') }}</td>
                    <td>
                        <div class="progress-bar-bg">
                            <div class="progress-bar" style="width: {{ $prog }}%"></div>
                        </div>
                        <span style="font-size:9px;color:#6b7280;">{{ number_format($prog, 1) }}%</span>
                    </td>
                    <td style="text-align:center">{{ $c->donations_count }}</td>
                    <td>{{ \Carbon\Carbon::parse($c->deadline)->format('d/m/Y') }}</td>
                    <td>
                        <span class="badge {{ $c->is_active ? 'badge-active' : 'badge-inactive' }}">
                            {{ $c->is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" style="text-align:center;padding:20px;color:#9ca3af;">Tidak ada data campaign.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Laporan ini dibuat otomatis oleh sistem Donasi Al-Khidmah &bull; {{ now()->format('d/m/Y H:i') }}
    </div>
</body>

</html>