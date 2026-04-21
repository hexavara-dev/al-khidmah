<!doctype html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Membuka Aplikasi</title>
</head>

<body style="font-family: sans-serif; padding: 24px;">
    <h3>Sedang membuka aplikasi...</h3>
    <p>Jika aplikasi tidak terbuka otomatis, tekan tombol di bawah.</p>

    <p><a href="{{ $deepLink }}"
            style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">Buka
            Aplikasi</a></p>
    <p><a href="{{ $returnUrl }}">Lanjut di browser</a></p>

    <script>
        window.location.href = @json($deepLink);
        setTimeout(function () {
            window.location.href = @json($returnUrl);
        }, 1800);
    </script>
</body>

</html>