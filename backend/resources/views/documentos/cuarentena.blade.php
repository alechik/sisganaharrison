@extends('documentos.layout')

@section('content')
    <table class="meta">
        <tr>
            <td width="50%"><strong>Código:</strong> {{ $cuarentena->cod_compra }}</td>
            <td><strong>Estado:</strong> {{ $estado_label }}</td>
        </tr>
        <tr>
            <td><strong>Proveedor:</strong> {{ $cuarentena->proveedor?->razon_social }}</td>
            <td><strong>NIT:</strong> {{ $cuarentena->proveedor?->nit ?: '—' }}</td>
        </tr>
        <tr>
            <td><strong>Usuario:</strong> {{ trim(($cuarentena->creador?->nombre ?? '').' '.($cuarentena->creador?->apellido ?? '')) }}</td>
            <td><strong>Origen:</strong> {{ $origen_label }}</td>
        </tr>
        <tr>
            <td><strong>Orden de compra:</strong> {{ $cuarentena->ordenCompra?->cod_compra ?: '—' }}</td>
            <td><strong>Inicio:</strong> {{ $cuarentena->fecha_inicio?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td><strong>Fin:</strong> {{ $cuarentena->fecha_fin?->format('d/m/Y') ?: '—' }}</td>
            <td></td>
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
            @foreach ($cuarentena->detalles as $detalle)
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
            <td class="text-right">{{ number_format((float) ($cuarentena->total_peso ?? 0), 2, ',', '.') }} kg</td>
        </tr>
        <tr>
            <td>Descuento general</td>
            <td class="text-right">{{ number_format((float) $cuarentena->descuento, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td><strong>Monto total</strong></td>
            <td class="text-right"><strong>{{ number_format((float) $cuarentena->monto_total, 2, ',', '.') }}</strong></td>
        </tr>
    </table>
@endsection
