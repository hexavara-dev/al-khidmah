<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;

class GoogleController extends Controller
{
    public function redirect(Request $request)
    {
        $isMobile = $request->boolean('mobile');

        Log::info('[GoogleOAuth] Redirect', [
            'is_mobile' => $isMobile,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return Socialite::driver('google')
            ->stateless()
            ->with([
                'prompt' => 'select_account',
                'state' => $isMobile ? 'mobile' : 'web',
            ])
            ->redirect();
    }

    public function callback(Request $request)
    {
        Log::info('[GoogleOAuth] Callback masuk', [
            'state' => $request->get('state'),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            Log::info('[GoogleOAuth] Google user berhasil didapat', [
                'google_id' => $googleUser->getId(),
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName(),
            ]);

            $user = User::updateOrCreate(
                ['google_id' => $googleUser->getId()],
                [
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ]
            );

            Log::info('[GoogleOAuth] User disimpan', [
                'user_id' => $user->id,
                'email' => $user->email,
                'is_new' => $user->wasRecentlyCreated,
            ]);

            Auth::login($user, true);

            $state = $request->get('state');

            // ── FLOW MOBILE ───────────────────────────────────────────
            if ($state === 'mobile') {
                $token = $user->createToken('mobile')->plainTextToken;

                $deepLink = 'ekhidmah://auth/callback'
                    . '?token=' . rawurlencode($token);

                $returnUrl = url('/mobile-auth/consume')
                    . '?token=' . rawurlencode($token)
                    . '&return_url=' . rawurlencode('/donasi?mobile=1');

                Log::info('[GoogleOAuth] Mobile flow: render blade', [
                    'user_id' => $user->id,
                    'deep_link' => $deepLink,
                    'return_url' => $returnUrl,
                ]);

                return view('auth.mobile-callback', compact('deepLink', 'returnUrl'));
            }

            // ── FLOW WEB ──────────────────────────────────────────────
            Log::info('[GoogleOAuth] Web flow: redirect ke home', [
                'user_id' => $user->id,
            ]);

            return redirect()->intended(route('home'));

        } catch (\Exception $e) {
            Log::error('[GoogleOAuth] Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            report($e);
            return redirect()->route('login')->with('error', 'Login Google gagal. Silakan coba lagi.');
        }
    }
}