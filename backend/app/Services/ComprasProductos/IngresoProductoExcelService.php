<?php

namespace App\Services\ComprasProductos;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use ZipArchive;

class IngresoProductoExcelService
{
    public const COLUMNAS = [
        'codigo_producto',
        'cantidad',
        'precio',
    ];

    /**
     * @return array{filename: string, content: string, mime: string}
     */
    public function plantilla(): array
    {
        return [
            'filename' => 'plantilla_ingreso_productos.xlsx',
            'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'content' => $this->buildXlsx([
                ['codigo_producto', 'cantidad', 'precio'],
                ['MED-001', '10', '15.50'],
            ]),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function parse(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: '');

        $filas = match ($extension) {
            'csv', 'txt' => $this->parseCsv($file->getRealPath() ?: ''),
            'xlsx' => $this->parseXlsx($file->getRealPath() ?: ''),
            default => throw ValidationException::withMessages([
                'archivo' => 'El archivo debe ser Excel (.xlsx) o CSV.',
            ]),
        };

        if ($filas === []) {
            throw ValidationException::withMessages([
                'archivo' => 'El archivo no contiene filas de productos.',
            ]);
        }

        return $filas;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function parseCsv(string $path): array
    {
        $handle = fopen($path, 'rb');
        if ($handle === false) {
            throw ValidationException::withMessages([
                'archivo' => 'No se pudo leer el archivo CSV.',
            ]);
        }

        $first = fgets($handle);
        if ($first === false) {
            fclose($handle);

            return [];
        }

        $first = preg_replace('/^\xEF\xBB\xBF/', '', $first) ?? $first;
        $delimiter = substr_count($first, ';') > substr_count($first, ',') ? ';' : ',';
        $headers = $this->normalizeHeaders(str_getcsv($first, $delimiter));
        $this->assertHeaders($headers);

        $filas = [];
        $linea = 1;
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $linea++;
            if ($this->isEmptyRow($row)) {
                continue;
            }
            $filas[] = $this->mapRow($headers, $row, $linea);
        }

        fclose($handle);

        return $filas;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function parseXlsx(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            throw ValidationException::withMessages([
                'archivo' => 'No se pudo abrir el archivo Excel.',
            ]);
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $sharedXml = $zip->getFromName('xl/sharedStrings.xml');
        $zip->close();

        if ($sheetXml === false) {
            throw ValidationException::withMessages([
                'archivo' => 'El archivo Excel no contiene una hoja válida.',
            ]);
        }

        $shared = $this->parseSharedStrings($sharedXml !== false ? $sharedXml : '');
        $rows = $this->parseSheetRows($sheetXml, $shared);
        if ($rows === []) {
            return [];
        }

        $headers = $this->normalizeHeaders(array_shift($rows) ?? []);
        $this->assertHeaders($headers);

        $filas = [];
        foreach ($rows as $index => $row) {
            if ($this->isEmptyRow($row)) {
                continue;
            }
            $filas[] = $this->mapRow($headers, $row, $index + 2);
        }

        return $filas;
    }

    /**
     * @return list<string>
     */
    private function parseSharedStrings(string $xml): array
    {
        if ($xml === '') {
            return [];
        }

        $strings = [];
        if (preg_match_all('/<si\b[^>]*>(.*?)<\/si>/s', $xml, $matches)) {
            foreach ($matches[1] as $si) {
                $text = '';
                if (preg_match_all('/<t[^>]*>(.*?)<\/t>/s', $si, $tMatches)) {
                    $text = implode('', array_map('html_entity_decode', $tMatches[1]));
                }
                $strings[] = html_entity_decode($text, ENT_QUOTES | ENT_XML1, 'UTF-8');
            }
        }

        return $strings;
    }

    /**
     * @param  list<string>  $shared
     * @return list<list<string>>
     */
    private function parseSheetRows(string $xml, array $shared): array
    {
        $rows = [];
        if (! preg_match_all('/<row\b[^>]*>(.*?)<\/row>/s', $xml, $rowMatches)) {
            return [];
        }

        foreach ($rowMatches[1] as $rowXml) {
            $cells = [];
            if (preg_match_all('/<c\b([^>]*)>(.*?)<\/c>/s', $rowXml, $cellMatches, PREG_SET_ORDER)) {
                foreach ($cellMatches as $cell) {
                    $attrs = $cell[1];
                    $inner = $cell[2];
                    $col = 0;
                    if (preg_match('/r="([A-Z]+)\d+"/', $attrs, $ref)) {
                        $col = $this->columnIndex($ref[1]);
                    }
                    $type = preg_match('/t="([^"]+)"/', $attrs, $tMatch) ? $tMatch[1] : '';
                    $value = '';
                    if ($type === 'inlineStr' && preg_match('/<t[^>]*>(.*?)<\/t>/s', $inner, $inline)) {
                        $value = html_entity_decode($inline[1], ENT_QUOTES | ENT_XML1, 'UTF-8');
                    } elseif (preg_match('/<v>(.*?)<\/v>/s', $inner, $vMatch)) {
                        $raw = html_entity_decode($vMatch[1], ENT_QUOTES | ENT_XML1, 'UTF-8');
                        $value = $type === 's' ? (string) ($shared[(int) $raw] ?? $raw) : $raw;
                    }
                    $cells[$col] = trim($value);
                }
            }

            if ($cells === []) {
                $rows[] = [];

                continue;
            }

            $max = max(array_keys($cells));
            $row = array_fill(0, $max + 1, '');
            foreach ($cells as $index => $value) {
                $row[$index] = $value;
            }
            $rows[] = $row;
        }

        return $rows;
    }

    private function columnIndex(string $letters): int
    {
        $index = 0;
        foreach (str_split($letters) as $char) {
            $index = ($index * 26) + (ord($char) - 64);
        }

        return $index - 1;
    }

    /**
     * @param  list<string>  $headers
     */
    private function assertHeaders(array $headers): void
    {
        $faltantes = array_values(array_diff(self::COLUMNAS, $headers));
        if ($faltantes !== []) {
            throw ValidationException::withMessages([
                'archivo' => 'Faltan columnas obligatorias: '.implode(', ', $faltantes).'.',
            ]);
        }
    }

    /**
     * @param  list<string|null>  $headers
     * @return list<string>
     */
    private function normalizeHeaders(array $headers): array
    {
        $aliases = [
            'codigo_producto' => 'codigo_producto',
            'codigoproducto' => 'codigo_producto',
            'codigo' => 'codigo_producto',
            'producto' => 'codigo_producto',
            'cantidad' => 'cantidad',
            'cant' => 'cantidad',
            'precio' => 'precio',
            'precio_unitario' => 'precio',
        ];

        return array_map(function ($header) use ($aliases) {
            $key = Str::of((string) $header)->lower()->replace(['á', 'é', 'í', 'ó', 'ú'], ['a', 'e', 'i', 'o', 'u'])->value();
            $key = (string) preg_replace('/[^a-z0-9]+/', '_', $key);
            $key = trim($key, '_');

            return $aliases[$key] ?? $key;
        }, $headers);
    }

    /**
     * @param  list<string>  $headers
     * @param  list<string|null>  $row
     * @return array<string, mixed>
     */
    private function mapRow(array $headers, array $row, int $linea): array
    {
        $mapped = ['linea' => $linea];
        foreach ($headers as $index => $header) {
            $mapped[$header] = isset($row[$index]) ? trim((string) $row[$index]) : '';
        }

        return $mapped;
    }

    /**
     * @param  list<string|null>  $row
     */
    private function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  list<list<string>>  $rows
     */
    private function buildXlsx(array $rows): string
    {
        $tmp = tempnam(sys_get_temp_dir(), 'ipxlsx');
        if ($tmp === false) {
            throw ValidationException::withMessages([
                'archivo' => 'No se pudo generar la plantilla Excel.',
            ]);
        }

        $zip = new ZipArchive;
        $zip->open($tmp, ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', <<<'XML'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>
XML);
        $zip->addFromString('_rels/.rels', <<<'XML'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
XML);
        $zip->addFromString('xl/_rels/workbook.xml.rels', <<<'XML'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>
XML);
        $zip->addFromString('xl/workbook.xml', <<<'XML'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Productos" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
XML);
        $zip->addFromString('xl/worksheets/sheet1.xml', $this->sheetXml($rows));
        $zip->close();

        $content = file_get_contents($tmp) ?: '';
        @unlink($tmp);

        return $content;
    }

    /**
     * @param  list<list<string>>  $rows
     */
    private function sheetXml(array $rows): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';

        foreach ($rows as $rowIndex => $row) {
            $r = $rowIndex + 1;
            $xml .= '<row r="'.$r.'">';
            foreach ($row as $colIndex => $value) {
                $cell = $this->columnLetter($colIndex).$r;
                $xml .= '<c r="'.$cell.'" t="inlineStr"><is><t>'.htmlspecialchars((string) $value, ENT_XML1).'</t></is></c>';
            }
            $xml .= '</row>';
        }

        return $xml.'</sheetData></worksheet>';
    }

    private function columnLetter(int $index): string
    {
        $letter = '';
        $index++;
        while ($index > 0) {
            $mod = ($index - 1) % 26;
            $letter = chr(65 + $mod).$letter;
            $index = intdiv($index - 1, 26);
        }

        return $letter;
    }
}
