@extends('documentos.layout')

@section('content')
    <table class="meta">
        <tr>
            <td width="50%"><strong>Código:</strong> {{ $salida->codigo }}</td>
            <td><strong>Fecha de salida:</strong> {{ $salida->fecha_salida?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td><strong>Tipo:</strong> {{ $salida->tipoSalida?->nombre }}</td>
            <td><strong>Estado:</strong> {{ $estado_label }}</td>
        </tr>
        <tr>
            <td><strong>Cliente:</strong> {{ $salida->cliente?->razon_social ?: '—' }}</td>
            <td><strong>Venta:</strong> {{ $salida->venta?->cod_venta ?: '—' }}</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Usuario:</strong> {{ trim(($salida->creador?->nombre ?? '').' '.($salida->creador?->apellido ?? '')) }}</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Arete</th>
                <th>Sexo</th>
                <th>Categoría</th>
                <th>Potrero / Lote</th>
                <th class="text-right">Peso</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Descuento</th>
                <th class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($salida->detalles as $detalle)
                @php
                    $sexo = $detalle->animal?->sexo;
                    $sexoLabel = $sexo === 'H' ? 'Hembra' : ($sexo === 'M' ? 'Macho' : '—');
                    $lote = $detalle->lote ?? $detalle->animal?->lote;
                    $potreroLote = trim(($lote?->potrero?->nombre ?? '—').' / '.($lote?->nombre ?? '—'));
                @endphp
                <tr>
                    <td>{{ $detalle->animal?->codigo ?: '—' }}</td>
                    <td>{{ $detalle->animal?->arete ?: '—' }}</td>
                    <td>{{ $sexoLabel }}</td>
                    <td>{{ $detalle->animal?->categoria?->nombre ?: '—' }}</td>
                    <td>{{ $potreroLote }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->peso, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->precio, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->descuento, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->subtotal, 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Animales</td>
            <td class="text-right">{{ $salida->detalles->count() }}</td>
        </tr>
        <tr>
            <td>Total peso</td>
            <td class="text-right">{{ number_format((float) ($salida->total_peso ?? 0), 2, ',', '.') }} kg</td>
        </tr>
        <tr>
            <td>Descuento general</td>
            <td class="text-right">{{ number_format((float) $salida->descuento, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td><strong>Monto total</strong></td>
            <td class="text-right"><strong>{{ number_format((float) $salida->monto_total, 2, ',', '.') }}</strong></td>
        </tr>
    </table>
@endsection
