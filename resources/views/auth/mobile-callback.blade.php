<!doctype html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Membuka Aplikasi — eKhidmah</title>
</head>

<body>
    <p>Login berhasil. Membuka aplikasi...</p>

    <script>
        // ✅ $token dikirim langsung dari controller — tidak perlu parse URL
        var token = @json($token);
        var returnUrl = @json($returnUrl);
        var deepLink = @json($deepLink);
        var isAndroid = /android/i.test(navigator.userAgent);

        if (isAndroid) {
            // Intent URL: langsung buka app tanpa dialog di Android
            window.location.href = 'intent://auth/callback'
                + '?token=' + encodeURIComponent(token)
                + '#Intent;scheme=ekhidmah;package=ekhidmah.com;end';
        } else {
            // iOS: pakai custom scheme
            window.location.href = deepLink;
        }

        // Fallback jika app tidak terbuka dalam 2.5 detik
        setTimeout(function () {
            if (!document.hidden) {
                window.location.href = returnUrl;
            }
        }, 2500);
    </script>
</body>

</html>