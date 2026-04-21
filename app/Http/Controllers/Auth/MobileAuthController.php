<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class MobileAuthController extends Controller
{
    public function consume(Request $request)
    {
        $plainToken = (string) $request->query('token', '');
        $returnUrl = (string) $request->query('return_url', '/donasi');

        if ($plainToken === '') {
            return response('Token tidak ada', 400);
        }

        // Cari token Sanctum dari plain text token
        $accessToken = PersonalAccessToken::findToken($plainToken);

        if (!$accessToken || !$accessToken->tokenable) {
            return response('Token tidak valid', 401);
        }

        $user = $accessToken->tokenable;

        // Login ke session web Laravel
        Auth::login($user, true);

        // Supaya token cuma sekali pakai
        $accessToken->delete();

        // Hindari open redirect: hanya izinkan URL internal
        if (!str_starts_with($returnUrl, '/')) {
            $returnUrl = '/donasi';
        }

        return redirect($returnUrl);
    }
}