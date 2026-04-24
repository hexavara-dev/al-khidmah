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
        var token = @json(new URL(@json($deepLink)) . searchParams . get('token'));
        var returnUrl = @json($returnUrl);
        var isAndroid = /android/i.test(navigator.userAgent);

        if (isAndroid) {
            window.location.href = 'intent://auth/callback'
                + '?token=' + encodeURIComponent(token)
                + '#Intent;scheme=ekhidmah;package=ekhidmah.com;end';
        } else {
            window.location.href = @json($deepLink);
        }

        // Fallback jika app tidak terbuka
        setTimeout(function () {
            if (!document.hidden) {
                window.location.href = returnUrl;
            }
        }, 2500);
    </script>
</body>

</html>