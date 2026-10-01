<?php

namespace App\Support;

class Money
{
    public static function format(mixed $value): string
    {
        return 'Bs '.number_format((float) ($value ?? 0), 2, '.', ',');
    }
}
