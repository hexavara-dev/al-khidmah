# Start ngrok and auto-update APP_URL in .env
$envFile = Join-Path $PSScriptRoot ".env"

# Check if ngrok is already running
$ngrokRunning = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
if (-not $ngrokRunning) {
    Write-Host "Starting ngrok..." -ForegroundColor Yellow
    Start-Process -FilePath "ngrok" -ArgumentList "http 8000" -WindowStyle Hidden

    # Wait for ngrok API to be ready (poll up to 15s)
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Milliseconds 500
        try {
            $null = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction Stop
            $ready = $true
            break
        } catch {}
    }
    if (-not $ready) {
        Write-Host "Timeout waiting for ngrok to start" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ngrok already running, grabbing URL..." -ForegroundColor Yellow
}

$response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels"

# Get HTTPS tunnel URL
$url = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -ExpandProperty public_url

if (-not $url) {
    Write-Host "Failed to get ngrok URL" -ForegroundColor Red
    exit 1
}

Write-Host "ngrok URL: $url" -ForegroundColor Green

# Update APP_URL in .env
$content = Get-Content $envFile -Raw
$content = $content -replace "APP_URL=.*", "APP_URL=$url"
Set-Content $envFile $content -NoNewline

# Clear Laravel config cache
php artisan config:clear

Write-Host ""
Write-Host "Done! Set these in Midtrans Sandbox Dashboard:" -ForegroundColor Cyan
Write-Host "  Notification URL : $url/payment/notification"
Write-Host "  Finish URL       : $url/payment/finish"
