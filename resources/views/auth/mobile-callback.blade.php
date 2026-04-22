<!doctype html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Membuka Aplikasi — eKhidmah</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
        .card { background: #fff; border-radius: 12px; padding: 32px 24px; max-width: 400px; width: 100%; box-shadow: 0 2px 12px rgba(0,0,0,0.08); text-align: center; }
        h3 { font-size: 18px; color: #111; margin-bottom: 8px; }
        p { font-size: 14px; color: #555; margin-bottom: 20px; line-height: 1.5; }
        .btn-primary { display: inline-block; padding: 12px 20px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; margin-bottom: 12px; width: 100%; }
        .btn-secondary { display: inline-block; padding: 10px 20px; background: transparent; color: #555; text-decoration: underline; font-size: 13px; }
        .status { font-size: 12px; color: #999; margin-top: 16px; }
        #countdown { font-weight: bold; color: #111; }
        /* debug panel */
        .debug { margin-top: 24px; background: #f0f0f0; border-radius: 8px; padding: 12px; text-align: left; font-size: 11px; color: #333; word-break: break-all; }
        .debug summary { cursor: pointer; font-weight: bold; margin-bottom: 8px; }
    </style>
</head>

<body>
    <div class="card">
        <h3>Login berhasil ✓</h3>
        <p>Sedang mengarahkan kembali ke aplikasi eKhidmah...</p>

        <a href="{{ $deepLink }}" class="btn-primary" id="open-app-btn">Buka Aplikasi</a>
        <br>
        <a href="{{ $returnUrl }}" class="btn-secondary">Lanjut di browser</a>

        <p class="status">Membuka otomatis dalam <span id="countdown">3</span> detik...</p>

        {{-- Debug info (hanya dev/staging) --}}
        @if(app()->environment(['local', 'staging']))
        <details class="debug">
            <summary>🔍 Debug Info</summary>
            <p><b>Deep Link:</b><br>{{ $deepLink }}</p>
            <p style="margin-top:8px"><b>Return URL:</b><br>{{ $returnUrl }}</p>
            <p style="margin-top:8px"><b>consume URL:</b><br>{{ url('/mobile-auth/consume') }}?token=...&amp;return_url=...</p>
            <p style="margin-top:8px"><b>Config deep_link_callback:</b> {{ config('services.mobile.deep_link_callback', '(tidak di-set)') }}</p>
        </details>
        @endif
    </div>

    <script>
        var deepLink  = @json($deepLink);
        var returnUrl = @json($returnUrl);
        var count     = 3;

        // Countdown
        var timer = setInterval(function () {
            count--;
            var el = document.getElementById('countdown');
            if (el) el.textContent = count;
            if (count <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        // Coba buka deep link
        // Gunakan iframe trick supaya tidak meninggalkan halaman ini di browser
        function tryDeepLink() {
            console.log('[eKhidmah] Mencoba deep link:', deepLink);
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = deepLink;
            document.body.appendChild(iframe);

            // Jika setelah 2.5 detik dokumen masih visible, kemungkinan deep link gagal
            setTimeout(function () {
                // Cek apakah page masih visible (gagal buka app)
                if (!document.hidden) {
                    console.warn('[eKhidmah] Deep link tidak berhasil membuka app. Redirect ke browser...');
                    window.location.href = returnUrl;
                }
            }, 2500);
        }

        // Tunggu 1 detik baru coba
        setTimeout(tryDeepLink, 1000);

        // Fallback: setelah 4 detik paksa redirect ke web
        setTimeout(function () {
            if (!document.hidden) {
                window.location.href = returnUrl;
            }
        }, 4000);
    </script>
</body>

</html>