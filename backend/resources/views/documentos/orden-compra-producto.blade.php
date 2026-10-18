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
                <th>Código</th>
                <th>Producto</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Descuento</th>
                <th class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($orden->detalles as $detalle)
                <tr>
                    <td>{{ $detalle->medicamento?->codigo ?: '—' }}</td>
                    <td>{{ $detalle->medicamento?->nombre }}</td>
                    <td class="text-right">{{ $detalle->cantidad }}</td>
                    <td class="text-right">{{ \App\Support\Money::format($detalle->precio) }}</td>
                    <td class="text-right">{{ \App\Support\Money::format($detalle->descuento) }}</td>
                    <td class="text-right">{{ \App\Support\Money::format($detalle->subtotal) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Descuento general</td>
            <td class="text-right">{{ \App\Support\Money::format($orden->descuento) }}</td>
        </tr>
        <tr>
            <td><strong>Monto total</strong></td>
            <td class="text-right"><strong>{{ \App\Support\Money::format($orden->monto_total) }}</strong></td>
        </tr>
    </table>
@endsection
