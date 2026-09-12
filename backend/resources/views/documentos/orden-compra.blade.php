@extends('documentos.layout')

@section('content')
    <table class="meta">
        <tr>
            <td width="50%"><strong>Código:</strong> {{ $orden->cod_compra }}</td>
            <td><strong>Fecha:</strong> {{ $orden->fecha?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td><strong>Proveedor:</strong> {{ $orden->proveedor?->razon_social }}</td>
            <td><strong>Estado:</strong> {{ $estado_label }}</td>
        </tr>
        <tr>
            <td><strong>Creado por:</strong> {{ trim(($orden->creador?->nombre ?? '').' '.($orden->creador?->apellido ?? '')) }}</td>
            <td><strong>NIT:</strong> {{ $orden->proveedor?->nit ?: '—' }}</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Categoría</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Peso ejemplar (kg)</th>
                <th class="text-right">Peso línea (kg)</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Desc. línea</th>
                <th class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($orden->detalles as $detalle)
                <tr>
                    <td>{{ $detalle->categoria?->nombre }}</td>
                    <td class="text-right">{{ $detalle->cantidad }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->peso, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->cantidad * (float) $detalle->peso, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->precio, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->descuento, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->subtotal, 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Total peso</td>
            <td class="text-right">{{ number_format((float) ($orden->total_peso ?? 0), 2, ',', '.') }} kg</td>
        </tr>
        <tr>
            <td>Descuento general</td>
            <td class="text-right">{{ number_format((float) $orden->descuento, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td><strong>Monto total</strong></td>
            <td class="text-right"><strong>{{ number_format((float) $orden->monto_total, 2, ',', '.') }}</strong></td>
        </tr>
    </table>

    @if ($orden->fecha_decision)
        <p style="margin-top: 20px;">
            <strong>Decisión:</strong> {{ $estado_label }}
            el {{ $orden->fecha_decision->format('d/m/Y H:i') }}
            por {{ trim(($orden->autorizador?->nombre ?? '').' '.($orden->autorizador?->apellido ?? '')) ?: '—' }}.
            @if ($orden->observacion_estado)
                <br><span class="muted">{{ $orden->observacion_estado }}</span>
            @endif
        </p>
    @endif
@endsection
