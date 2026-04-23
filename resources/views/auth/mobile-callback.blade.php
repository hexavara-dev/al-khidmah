<!doctype html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Membuka Aplikasi</title>
</head>

<body>
    <script>
        var token = @json($token);
        var packageName = @json($packageName);
        var returnUrl = @json($returnUrl);

        // Intent URL — Chrome Android langsung buka app tanpa dialog/tombol
        var intentUrl = 'intent://auth/callback'
            + '?token=' + encodeURIComponent(token)
            + '&return_url=' + encodeURIComponent('/donasi?mobile=1')
            + '#Intent'
            + ';scheme=ekhidmah'
            + ';package=' + packageName
            + ';end';

        // Langsung redirect — tidak ada tombol, tidak ada delay tampilan
        window.location.href = intentUrl;
    </script>
</body>

</html>