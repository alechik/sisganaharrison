<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    // Flutter web usa un puerto aleatorio (Chrome/Edge). El SPA Vite sigue en 5173.
    'allowed_origins_patterns' => [
        '/^https?:\/\/localhost(:\d+)?$/',
        '/^https?:\/\/127\.0\.0\.1(:\d+)?$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => true,

];