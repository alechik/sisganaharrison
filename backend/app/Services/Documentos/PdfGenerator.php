<?php

namespace App\Services\Documentos;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class PdfGenerator
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function download(string $view, array $data, string $filename, string $orientation = 'portrait'): Response
    {
        $pdf = Pdf::loadView($view, $data)
            ->setPaper('a4', $orientation);

        return $pdf->download($filename);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function stream(string $view, array $data, string $filename, string $orientation = 'portrait'): Response
    {
        $pdf = Pdf::loadView($view, $data)
            ->setPaper('a4', $orientation);

        return $pdf->stream($filename);
    }
}
