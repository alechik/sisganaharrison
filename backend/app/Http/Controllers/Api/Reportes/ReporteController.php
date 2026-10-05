<?php

namespace App\Http\Controllers\Api\Reportes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reportes\ReporteRequest;
use App\Services\Documentos\PdfGenerator;
use App\Services\Reportes\ReporteService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ReporteController extends Controller
{
    public function __construct(
        private readonly ReporteService $reporteService,
        private readonly PdfGenerator $pdfGenerator,
    ) {}

    public function show(ReporteRequest $request, string $tipo): JsonResponse
    {
        return response()->json([
            'data' => $this->reporteService->generar($tipo, $request->filtros()),
        ]);
    }

    public function pdf(ReporteRequest $request, string $tipo): Response
    {
        abort_unless($request->user()?->can('reportes.export'), 403);

        $filtros = $request->filtros();
        $filtros['para_pdf'] = true;
        $reporte = $this->reporteService->generar($tipo, $filtros);

        return $this->pdfGenerator->download(
            'documentos.reporte',
            [
                'titulo' => $reporte['titulo'],
                'reporte' => $reporte,
            ],
            'reporte-'.$tipo.'.pdf',
            'landscape',
        );
    }
}
