@extends('documentos.layout')

@section('content')
    <table class="meta">
        @foreach ($reporte['filtros'] as $filtro)
            <tr>
                <td width="28%"><strong>{{ $filtro['etiqueta'] }}:</strong></td>
                <td>{{ $filtro['valor'] }}</td>
            </tr>
        @endforeach
        <tr>
            <td><strong>Generado:</strong></td>
            <td>{{ $reporte['generado_en'] }}</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Indicador</th>
                <th class="text-right">Valor</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($reporte['totales'] as $total)
                <tr>
                    <td>{{ $total['etiqueta'] }}</td>
                    <td class="text-right">{{ $total['valor'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="2" class="muted">Sin indicadores.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    @foreach ($reporte['grupos'] as $grupo)
        <h1 style="margin-top: 18px;">{{ $grupo['titulo'] }}</h1>
        <table>
            <thead>
                <tr>
                    <th>Concepto</th>
                    <th class="text-right">Valor</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($grupo['filas'] as $fila)
                    <tr>
                        <td>{{ $fila['etiqueta'] }}</td>
                        <td class="text-right">{{ $fila['total'] }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="2" class="muted">Sin registros en este grupo.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endforeach

    <h1 style="margin-top: 18px;">Detalle</h1>
    @if ($reporte['detalle']['meta']['truncado'])
        <p class="muted">Se muestran los primeros {{ $reporte['detalle']['meta']['per_page'] }} de {{ $reporte['detalle']['meta']['total'] }} registros.</p>
    @endif
    <table>
        <thead>
            <tr>
                @foreach ($reporte['detalle']['columnas'] as $columna)
                    <th>{{ $columna }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($reporte['detalle']['filas'] as $fila)
                <tr>
                    @foreach ($fila as $celda)
                        <td>{{ $celda }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ max(1, count($reporte['detalle']['columnas'])) }}" class="muted">Sin registros para los filtros indicados.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
