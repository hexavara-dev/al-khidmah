Jalankan ini di terminal
.\ngrok-start.ps1

1. Cek apakah ngrok sudah jalan — kalau belum, start dulu
2. Ambil URL publik terbaru dari ngrok API
3. Update APP_URL di .env
4. Clear Laravel config cache
5. Tampilkan URL yang perlu di-paste ke Midtrans Dashboard
5.a. Buka: https://dashboard.sandbox.midtrans.com
5.b. Notification URL (webhook):
    - Settings → Configuration
    - Settings → payment → https://dashboard.sandbox.midtrans.com/settings/payment -> notification url
    https://da29-103-164-111-178.ngrok-free.app/payment/notification
    - Klik Save
5.c. Finish URL:
    - Settings → payment → https://dashboard.sandbox.midtrans.com/settings/payment -> finish redirect url
    - Isi kolom Finish dengan:
    https://da29-103-164-111-178.ngrok-free.app/payment/finish
    - Klik Save
5.d. Finish URL Snap preferences
    - Settings → snap preferences → system settings (scroll bawah) -> 
    - Isi kolom Finish, Error payment:
    https://da29-103-164-111-178.ngrok-free.app/payment/finish
    - Klik Save

<Penting Juga>
Set IAK sandbox callback URL — Go to https://developer.iak.id/dev-setting and set callback URL to:
https://da29-103-164-111-178.ngrok-free.app/ppob/callback

<But>
"For prepaid products, you must manually change the transaction status to success or failed in sandbox report. But in production environment, you don't need to manually change the transaction status because we are the one who will update the status manually through callback URL."
https://api.iak.id/developer/integration/sandbox-report

