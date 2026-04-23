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
        $stateValue = $isMobile ? 'mobile' : 'web';

        Log::channel('stack')->info('[GoogleOAuth] redirect() dipanggil', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'mobile_param' => $request->get('mobile'),
            'is_mobile' => $isMobile,
            'state_sent' => $stateValue,
            'referer' => $request->header('Referer'),
        ]);

        return Socialite::driver('google')
            ->stateless()
            ->with([
                'prompt' => 'select_account',
                'state' => $stateValue,
            ])
            ->redirect();
    }

    public function callback(Request $request)
    {
        $state = $request->get('state');
        $hasCode = $request->has('code');
        $hasError = $request->has('error');

        Log::channel('stack')->info('[GoogleOAuth] callback() diterima', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'state' => $state,
            'has_code' => $hasCode,
            'has_error' => $hasError,
            'error' => $request->get('error'),
            'all_params' => $request->except(['code']),
        ]);

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            Log::channel('stack')->info('[GoogleOAuth] Google user berhasil diambil', [
                'google_id' => $googleUser->getId(),
                'email' => $googleUser->getEmail(),
                'state' => $state,
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

            Auth::login($user, true);

            // =========================================================
            // FLOW MOBILE
            // =========================================================
            if ($state === 'mobile') {
                $token = $user->createToken('mobile')->plainTextToken;
                $returnUrl = '/donasi?mobile=1';

                Log::channel('stack')->info('[GoogleOAuth] Mobile flow — tampil halaman intent', [
                    'user_id' => $user->id,
                ]);

                return response()->view('auth.mobile-callback', [
                    'token' => $token,
                    'returnUrl' => url($returnUrl),
                    'packageName' => 'ekhidmah.com', // applicationId dari build.gradle
                ]);
            }

            // =========================================================
            // FLOW WEB
            // =========================================================
            Log::channel('stack')->info('[GoogleOAuth] Web flow — redirect ke home', [
                'user_id' => $user->id,
            ]);

            return redirect()->intended(route('home'));

        } catch (\Exception $e) {
            Log::channel('stack')->error('[GoogleOAuth] callback() GAGAL', [
                'error' => $e->getMessage(),
                'state' => $state,
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('login')->with('error', 'Login Google gagal: ' . $e->getMessage());
        }
    }
}