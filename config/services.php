<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'jemaah' => [
        'auth_server_url' => env('JEMAAH_AUTH_SERVER_URL', 'https://jamaah.alkhidmah.or.id'),
        'client_id'       => env('JEMAAH_CLIENT_ID', '019dab4d-798e-71d1-a147-3be52fbc317a'),
        'client_secret'   => env('JEMAAH_CLIENT_SECRET', 'HrYtLve7reKH3DrTWtVDvtBjOrsoBGcuwtftmWqh'),
        'redirect_uri'    => env('JEMAAH_REDIRECT_URI', 'http://localhost:8000/auth/jemaah/callback'),
    ],

    'google' => [
        'client_id'     => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect'      => env('GOOGLE_REDIRECT_URI', '/auth/google/callback'),
    ],

    'iak' => [
        'user_hp'              => env('IAK_USER_HP'),
        'api_key'              => env('IAK_API_KEY'),
        'prepaid_url'          => env('IAK_PREPAID_URL',          'https://prepaid.iak.dev/api'),
        'postpaid_url'         => env('IAK_POSTPAID_URL',         'https://testpostpaid.mobilepulsa.net/api/v1/bill/check'),
        'postpaid_payment_url' => env('IAK_POSTPAID_PAYMENT_URL', 'https://testpostpaid.mobilepulsa.net/api/v1/bill/payment'),
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        'snap_url' => env('MIDTRANS_SNAP_URL'),
    ],

];
