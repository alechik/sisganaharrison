@extends('documentos.layout')

@section('content')
    <table class="meta">
        <tr>
            <td width="50%"><strong>Código:</strong> {{ $evento->codigo_evento_sanitario ?? ('EVS-'.$evento->id) }}</td>
            <td><strong>Fecha:</strong> {{ $evento->fecha?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td><strong>Tipo:</strong> {{ $evento->tipoEvento?->nombre }}</td>
            <td><strong>Responsable:</strong> {{ trim(($evento->usuario?->nombre ?? '').' '.($evento->usuario?->apellido ?? '')) }}</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Diagnóstico:</strong> {{ $evento->diagnostico ?: '—' }}</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Tratamiento:</strong> {{ $evento->tratamiento ?: '—' }}</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Animal</th>
                <th>Potrero</th>
                <th>Producto</th>
                <th>Almacén</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Peso</th>
                <th class="text-right">Precio</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($evento->detalles as $detalle)
                <tr>
                    <td>{{ $detalle->animal?->codigo }}</td>
                    <td>{{ $detalle->lote?->nombre ?: '—' }}</td>
                    <td>{{ $detalle->medicamento?->nombre }}</td>
                    <td>{{ $detalle->almacen?->nombre ?: '—' }}</td>
                    <td class="text-right">{{ $detalle->cantidad }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->peso_animal, 2, ',', '.') }}</td>
                    <td class="text-right">{{ \App\Support\Money::format($detalle->precio_medicamento) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td><strong>Total</strong></td>
            <td class="text-right"><strong>{{ \App\Support\Money::format($evento->total) }}</strong></td>
        </tr>
    </table>
@endsection
