@extends('documentos.layout')

@section('content')
    <table class="meta">
        <tr>
            <td width="50%"><strong>Traspaso:</strong> #{{ $traspaso->id }}</td>
            <td><strong>Fecha:</strong> {{ $traspaso->fecha_traspaso?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td><strong>Lote de salida:</strong> {{ $traspaso->loteSalida?->codigo }} — {{ $traspaso->loteSalida?->nombre }}</td>
            <td><strong>Lote de ingreso:</strong> {{ $traspaso->loteIngreso?->codigo }} — {{ $traspaso->loteIngreso?->nombre }}</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Usuario:</strong> {{ trim(($traspaso->usuario?->nombre ?? '').' '.($traspaso->usuario?->apellido ?? '')) ?: '—' }}</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Observación:</strong> {{ $traspaso->observacion ?: '—' }}</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Arete</th>
                <th>Sexo</th>
                <th>Categoría</th>
                <th class="text-right">Peso</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($traspaso->detalles as $detalle)
                @php
                    $sexo = $detalle->animal?->sexo;
                    $sexoLabel = $sexo === 'H' ? 'Hembra' : ($sexo === 'M' ? 'Macho' : '—');
                @endphp
                <tr>
                    <td>{{ $detalle->animal?->codigo ?: '—' }}</td>
                    <td>{{ $detalle->animal?->arete ?: '—' }}</td>
                    <td>{{ $sexoLabel }}</td>
                    <td>{{ $detalle->animal?->categoria?->nombre ?: '—' }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->peso, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->precio, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format((float) $detalle->subtotal, 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Animales</td>
            <td class="text-right">{{ $traspaso->detalles->count() }}</td>
        </tr>
        <tr>
            <td>Total peso</td>
            <td class="text-right">{{ number_format((float) $traspaso->total_peso, 2, ',', '.') }} kg</td>
        </tr>
        <tr>
            <td><strong>Monto total</strong></td>
            <td class="text-right"><strong>{{ number_format((float) $traspaso->monto_total, 2, ',', '.') }}</strong></td>
        </tr>
    </table>
@endsection
