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
            'ip'          => $request->ip(),
            'user_agent'  => $request->userAgent(),
            'mobile_param'=> $request->get('mobile'),
            'is_mobile'   => $isMobile,
            'state_sent'  => $stateValue,
            'referer'     => $request->header('Referer'),
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
        $state        = $request->get('state');
        $hasCode      = $request->has('code');
        $hasError     = $request->has('error');

        Log::channel('stack')->info('[GoogleOAuth] callback() diterima', [
            'ip'          => $request->ip(),
            'user_agent'  => $request->userAgent(),
            'state'       => $state,
            'has_code'    => $hasCode,
            'has_error'   => $hasError,
            'error'       => $request->get('error'),
            'all_params'  => $request->except(['code']), // jangan log code mentah
        ]);

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            Log::channel('stack')->info('[GoogleOAuth] Google user berhasil diambil', [
                'google_id' => $googleUser->getId(),
                'email'     => $googleUser->getEmail(),
                'state'     => $state,
            ]);

            $user = User::updateOrCreate(
                ['google_id' => $googleUser->getId()],
                [
                    'name'              => $googleUser->getName(),
                    'email'             => $googleUser->getEmail(),
                    'avatar'            => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ]
            );

            Auth::login($user, true);

            // token untuk mobile
            $token = $user->createToken('mobile')->plainTextToken;

            // =========================
            // FLOW MOBILE
            // =========================
            if ($state === 'mobile') {
                $returnUrl    = url('/mobile-auth/consume?return_url=' . urlencode('/donasi?mobile=1'));
                $callbackBase = config('services.mobile.deep_link_callback', 'ekhidmah://callback');
                $deepLink     = $callbackBase . '?token=' . rawurlencode($token) . '&return_url=' . rawurlencode(url('/donasi?mobile=1'));

                Log::channel('stack')->info('[GoogleOAuth] Mobile flow — deep link dibuat', [
                    'user_id'       => $user->id,
                    'deep_link'     => $deepLink,
                    'return_url'    => $returnUrl,
                    'callback_base' => $callbackBase,
                    'config_set'    => config('services.mobile.deep_link_callback') !== null,
                ]);

                return response()->view('auth.mobile-callback', [
                    'deepLink'  => $deepLink,
                    'returnUrl' => $returnUrl,
                    'token'     => $token, // dikirim ke view untuk fallback
                ]);
            }

            // =========================
            // FLOW WEB
            // =========================
            Log::channel('stack')->info('[GoogleOAuth] Web flow — redirect ke home', [
                'user_id' => $user->id,
            ]);

            return redirect()->intended(route('home'));

        } catch (\Exception $e) {
            Log::channel('stack')->error('[GoogleOAuth] callback() GAGAL', [
                'error'   => $e->getMessage(),
                'state'   => $state,
                'trace'   => $e->getTraceAsString(),
            ]);

            return redirect()->route('login')->with('error', 'Login Google gagal: ' . $e->getMessage());
        }
    }
}
