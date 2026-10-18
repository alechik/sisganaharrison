@extends('documentos.layout')

@section('content')
    <table class="meta">
        <tr>
            <td width="50%"><strong>Código:</strong> {{ $servicio->codigo_servicio ?? ('SRV-'.$servicio->id) }}</td>
            <td><strong>Fecha:</strong> {{ $servicio->fecha_servicio?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td><strong>Hembra:</strong> {{ $servicio->hembra?->codigo }} {{ $servicio->hembra?->arete ? '· '.$servicio->hembra->arete : '' }}</td>
            <td><strong>Macho:</strong> {{ $servicio->macho?->codigo ?: '—' }}</td>
        </tr>
        <tr>
            <td><strong>Tipo:</strong> {{ $servicio->tipo_servicio }}</td>
            <td><strong>Resultado:</strong> {{ $servicio->resultado ?: '—' }}</td>
        </tr>
        <tr>
            <td><strong>Responsable:</strong> {{ trim(($servicio->usuario?->nombre ?? '').' '.($servicio->usuario?->apellido ?? '')) }}</td>
            <td><strong>Total insumos:</strong> {{ \App\Support\Money::format($servicio->total) }}</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Producto</th>
                <th>Almacén</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Precio</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($servicio->insumos as $insumo)
                <tr>
                    <td>{{ $insumo->medicamento?->nombre }}</td>
                    <td>{{ $insumo->almacen?->nombre ?: '—' }}</td>
                    <td class="text-right">{{ $insumo->cantidad }}</td>
                    <td class="text-right">{{ \App\Support\Money::format($insumo->precio) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">Sin insumos registrados.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
