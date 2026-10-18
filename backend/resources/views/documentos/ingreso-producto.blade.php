@extends('documentos.layout')

@section('content')
    <table class="meta">
        <tr>
            <td width="50%"><strong>Código:</strong> {{ $ingreso->cod_ingreso }}</td>
            <td><strong>Fecha:</strong> {{ $ingreso->fecha?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td><strong>Orden de origen:</strong> {{ $ingreso->orden?->cod_compra ?? '—' }}</td>
            <td><strong>Almacén:</strong> {{ $ingreso->almacen?->nombre ?? '—' }}</td>
        </tr>
        <tr>
            <td><strong>Proveedor:</strong> {{ $ingreso->proveedor?->razon_social }}</td>
            <td><strong>Registrado por:</strong> {{ trim(($ingreso->creador?->nombre ?? '').' '.($ingreso->creador?->apellido ?? '')) }}</td>
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
            @foreach ($ingreso->detalles as $detalle)
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
            <td class="text-right">{{ \App\Support\Money::format($ingreso->descuento) }}</td>
        </tr>
        <tr>
            <td><strong>Monto total</strong></td>
            <td class="text-right"><strong>{{ \App\Support\Money::format($ingreso->monto_total) }}</strong></td>
        </tr>
    </table>
@endsection
