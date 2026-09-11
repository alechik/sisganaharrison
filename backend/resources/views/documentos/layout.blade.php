<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $titulo ?? 'Documento' }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1f2937; margin: 0; padding: 24px; }
        .header { display: table; width: 100%; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 18px; }
        .header-left { display: table-cell; vertical-align: middle; width: 70%; }
        .header-right { display: table-cell; vertical-align: middle; text-align: right; }
        .brand { font-size: 20px; font-weight: bold; color: #0f766e; }
        .subtitle { font-size: 11px; color: #6b7280; }
        h1 { font-size: 16px; margin: 0 0 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #0f766e; color: #fff; text-align: left; padding: 7px 8px; font-size: 11px; }
        td { border-bottom: 1px solid #e5e7eb; padding: 7px 8px; }
        .meta { width: 100%; }
        .meta td { border: none; padding: 3px 0; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; }
        .totals { margin-top: 16px; width: 40%; margin-left: auto; }
        .totals td { border: none; padding: 4px 0; }
        .footer { margin-top: 28px; font-size: 10px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 8px; }
        .text-right { text-align: right; }
        .muted { color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="brand">SisGanadería</div>
            <div class="subtitle">Agropecuaria Harrison</div>
        </div>
        <div class="header-right">
            <h1>{{ $titulo ?? 'Documento' }}</h1>
            <div class="subtitle">{{ $fecha_emision ?? now()->format('d/m/Y H:i') }}</div>
        </div>
    </div>
    @yield('content')
    <div class="footer">
        Documento generado por SisGanadería · {{ now()->format('d/m/Y H:i') }}
    </div>
</body>
</html>
