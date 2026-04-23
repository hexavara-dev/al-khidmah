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

        $accessToken = PersonalAccessToken::findToken($plainToken);

        if (!$accessToken || !$accessToken->tokenable) {
            return response('Token tidak valid', 401);
        }

        $user = $accessToken->tokenable;

        Auth::login($user, true);
        $request->session()->regenerate();

        $accessToken->delete();

        if (!str_starts_with($returnUrl, '/')) {
            $returnUrl = '/donasi';
        }

        return redirect($returnUrl);
    }
}