@extends('documentos.layout')

@section('content')
    <table class="meta">
        <tr>
            <td width="50%"><strong>Código:</strong> {{ $ingreso->codigo }}</td>
            <td><strong>Fecha de ingreso:</strong> {{ $ingreso->fecha_ingreso?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td><strong>Proveedor:</strong> {{ $ingreso->proveedor?->razon_social }}</td>
            <td><strong>NIT:</strong> {{ $ingreso->proveedor?->nit ?: '—' }}</td>
        </tr>
        <tr>
            <td><strong>Cuarentena de origen:</strong> {{ $ingreso->cuarentena?->cod_compra ?: '—' }}</td>
            <td><strong>Lote destino:</strong> {{ $ingreso->lote?->codigo ? $ingreso->lote->codigo.' — ' : '' }}{{ $ingreso->lote?->nombre }}</td>
        </tr>
        <tr>
            <td><strong>Usuario:</strong> {{ trim(($ingreso->creador?->nombre ?? '').' '.($ingreso->creador?->apellido ?? '')) }}</td>
            <td><strong>Estado:</strong> Registrado</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Observación general:</strong> {{ $ingreso->observaciones ?: '—' }}</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Sexo</th>
                <th>Categoría</th>
                <th class="text-right">Edad (meses)</th>
                <th class="text-right">Peso cuarentena</th>
                <th class="text-right">Peso ingreso</th>
                <th class="text-right">Precio compra</th>
                <th>Observaciones</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($ingreso->detalles as $detalle)
                @php
                    $sexo = $detalle->animal?->sexo;
                    $sexoLabel = $sexo === 'H' ? 'Hembra' : ($sexo === 'M' ? 'Macho' : '—');
                @endphp
                <tr>
                    <td>{{ $detalle->animal?->codigo ?: '—' }}</td>
                    <td>{{ $sexoLabel }}</td>
                    <td>{{ $detalle->animal?->categoria?->nombre ?: '—' }}</td>
                    <td class="text-right">{{ $detalle->edad !== null ? $detalle->edad : '—' }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->peso_oc, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->peso_ingreso, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->precio_compra, 2, ',', '.') }}</td>
                    <td>{{ $detalle->observaciones ?: '—' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Animales</td>
            <td class="text-right">{{ $ingreso->detalles->count() }}</td>
        </tr>
        <tr>
            <td>Total peso ingreso</td>
            <td class="text-right">{{ number_format((float) ($ingreso->total_peso ?? 0), 2, ',', '.') }} kg</td>
        </tr>
        <tr>
            <td>Descuento general</td>
            <td class="text-right">{{ number_format((float) $ingreso->descuento, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td><strong>Monto total</strong></td>
            <td class="text-right"><strong>{{ number_format((float) $ingreso->monto_total, 2, ',', '.') }}</strong></td>
        </tr>
    </table>
@endsection
