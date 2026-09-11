<?php

namespace App\Services\Documentos;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class PdfGenerator
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function download(string $view, array $data, string $filename): Response
    {
        $pdf = Pdf::loadView($view, $data)
            ->setPaper('a4', 'portrait');

        return $pdf->download($filename);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function stream(string $view, array $data, string $filename): Response
    {
        $pdf = Pdf::loadView($view, $data)
            ->setPaper('a4', 'portrait');

        return $pdf->stream($filename);
    }
}
