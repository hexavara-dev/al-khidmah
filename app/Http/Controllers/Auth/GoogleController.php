<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;

class GoogleController extends Controller
{
    public function redirect(Request $request)
    {
        $isMobile = $request->get('mobile');

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
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::updateOrCreate(
                ['google_id' => $googleUser->getId()],
                [
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ]
            );

            Auth::login($user, true);

            // token untuk mobile
            $token = $user->createToken('mobile')->plainTextToken;

            $state = $request->get('state');

            // =========================
            // FLOW MOBILE
            // =========================
            if ($state === 'mobile') {
                // Tampilkan halaman perantara untuk membuka deep link.
                // Beberapa browser mobile memblokir custom scheme pada 302 redirect.
                $returnUrl = url('/donasi?mobile=1');
                $callbackBase = config('services.mobile.deep_link_callback', 'ekhidmah://callback');
                $deepLink = $callbackBase . '?token=' . rawurlencode($token) . '&return_url=' . rawurlencode($returnUrl);

                return response()->view('auth.mobile-callback', [
                    'deepLink' => $deepLink,
                    'returnUrl' => $returnUrl,
                ]);
            }

            // =========================
            // FLOW WEB
            // =========================
            return redirect()->intended(route('home'));

        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Login Google gagal');
        }
    }
}