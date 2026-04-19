<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class JemaahController extends Controller
{
    private string $authServerUrl;
    private string $clientId;
    private string $redirectUri;

    public function __construct()
    {
        $this->authServerUrl = config('services.jemaah.auth_server_url');
        $this->clientId      = config('services.jemaah.client_id');
        $this->redirectUri   = config('services.jemaah.redirect_uri');
    }

    public function redirect(Request $request)
    {
        $verifier  = $this->generateCodeVerifier();
        $challenge = $this->generateCodeChallenge($verifier);

        $request->session()->put('jemaah_oauth_verifier', $verifier);

        $params = http_build_query([
            'response_type'         => 'code',
            'client_id'             => $this->clientId,
            'redirect_uri'          => $this->redirectUri,
            'code_challenge'        => $challenge,
            'code_challenge_method' => 'S256',
            'prompt'                => 'login',
        ]);

        return redirect("{$this->authServerUrl}/oauth/authorize?{$params}");
    }

    public function callback(Request $request)
    {
        // Handle OAuth error from server
        if ($request->query('error')) {
            return redirect()->route('login')->withErrors(['jemaah' => $request->query('error_description') ?? $request->query('error')]);
        }

        $verifier = $request->session()->pull('jemaah_oauth_verifier');

        // Exchange code for token
        $tokenResponse = Http::asForm()->post("{$this->authServerUrl}/oauth/token", [
            'grant_type'    => 'authorization_code',
            'client_id'     => $this->clientId,
            'redirect_uri'  => $this->redirectUri,
            'code_verifier' => $verifier,
            'code'          => $request->query('code'),
        ]);

        if (!$tokenResponse->successful()) {
            return redirect()->route('login')->withErrors(['jemaah' => 'Gagal mendapatkan token. Silakan coba lagi.']);
        }

        $accessToken = $tokenResponse->json('access_token');

        // Fetch user profile
        $profileResponse = Http::withToken($accessToken)
            ->get("{$this->authServerUrl}/api/v1/user");

        if (!$profileResponse->successful()) {
            return redirect()->route('login')->withErrors(['jemaah' => 'Gagal mengambil data profil. Silakan coba lagi.']);
        }

        $raw     = $profileResponse->json();
        $profile = $raw['data'] ?? $raw;

$user = User::updateOrCreate(
            ['email' => $profile['email']],
            [
                'name'              => $profile['name'],
                'avatar'            => $profile['avatar'] ?? $profile['photo'] ?? null,
                'email_verified_at' => now(),
            ]
        );

        Auth::login($user, remember: true);

        return redirect()->intended(route('home'));
    }

    private function generateCodeVerifier(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    private function generateCodeChallenge(string $verifier): string
    {
        return rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');
    }
}
