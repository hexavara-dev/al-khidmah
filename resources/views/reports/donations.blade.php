<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan Donasi</title>
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
            background: #eff6ff;
            border: 1px solid #bfdbfe;
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

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 9px;
            font-weight: 600;
        }

        .badge-success {
            background: #dcfce7;
            color: #16a34a;
        }

        .badge-pending {
            background: #fef9c3;
            color: #a16207;
        }

        .badge-failed {
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
        <h1>💰 Laporan Donasi — {{ $filterMonth }} &bull; {{ $filterStatus }}</h1>
        <p>Dicetak pada {{ now()->format('d F Y, H:i') }} WIB &bull; Donasi Al-Khidmah</p>
    </div>

    <div class="meta">
        <div class="meta-card">
            <div class="label">Total Transaksi</div>
            <div class="value">{{ $donations->count() }}</div>
        </div>
        <div class="meta-card">
            <div class="label">Total Terkumpul (Sukses)</div>
            <div class="value">Rp {{ number_format($totalAmount, 0, ',', '.') }}</div>
        </div>
        <div class="meta-card">
            <div class="label">Donasi Sukses</div>
            <div class="value">{{ $donations->where('status', 'success')->count() }}</div>
        </div>
        <div class="meta-card">
            <div class="label">Donasi Pending</div>
            <div class="value">{{ $donations->where('status', 'pending')->count() }}</div>
        </div>
        <div class="meta-card">
            <div class="label">Donasi Gagal</div>
            <div class="value">{{ $donations->where('status', 'failed')->count() }}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:3%">#</th>
                <th style="width:16%">Donatur</th>
                <th style="width:22%">Campaign</th>
                <th style="width:13%">Nominal</th>
                <th style="width:12%">Metode</th>
                <th style="width:16%">Catatan / Niat</th>
                <th style="width:10%">Tanggal</th>
                <th style="width:8%">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($donations as $i => $d)
                @php
                    $isAnon = str_starts_with($d->note ?? '', '[Anonim]');
                    $donorName = $isAnon ? 'Hamba Allah' : ($d->user?->name ?? 'Anonim');
                    $note = $isAnon ? trim(str_replace('[Anonim]', '', $d->note ?? '')) : ($d->note ?? '-');
                @endphp
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $donorName }}</td>
                    <td>{{ $d->campaign?->title ?? '-' }}</td>
                    <td class="amount">Rp {{ number_format($d->amount, 0, ',', '.') }}</td>
                    <td style="text-transform:capitalize">{{ str_replace('_', ' ', $d->payment_method ?? '-') }}</td>
                    <td style="color:#6b7280;font-style:italic;">{{ $note ?: '-' }}</td>
                    <td>{{ \Carbon\Carbon::parse($d->created_at)->format('d/m/Y H:i') }}</td>
                    <td>
                        <span class="badge badge-{{ $d->status }}">
                            {{ $d->status === 'success' ? 'Sukses' : ($d->status === 'failed' ? 'Gagal' : 'Pending') }}
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align:center;padding:20px;color:#9ca3af;">Tidak ada data donasi.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Laporan ini dibuat otomatis oleh sistem Donasi Al-Khidmah &bull; {{ now()->format('d/m/Y H:i') }}
    </div>
</body>

</html>