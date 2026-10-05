import Pagination from "@/components/common/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Reporte } from "../types";

interface Props {
  reporte: Reporte;
  onPageChange: (page: number) => void;
}

export default function ReporteResult({ reporte, onPageChange }: Props) {
  const vacio = reporte.detalle.meta.total === 0 && reporte.grupos.every((grupo) => grupo.filas.length === 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white">{reporte.titulo}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generado {reporte.generado_en}</p>
        <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {reporte.filtros.map((filtro) => (
            <div key={filtro.etiqueta}>
              <dt className="text-xs text-gray-500 dark:text-gray-400">{filtro.etiqueta}</dt>
              <dd className="text-sm text-gray-800 dark:text-gray-200">{filtro.valor}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {reporte.totales.map((total) => (
          <div
            key={total.etiqueta}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{total.etiqueta}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">{total.valor}</p>
          </div>
        ))}
      </div>

      {reporte.grupos.map((grupo) => (
        <div
          key={grupo.titulo}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"
        >
          <h4 className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white">{grupo.titulo}</h4>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 text-left text-xs text-gray-500">Concepto</TableCell>
                  <TableCell isHeader className="px-4 py-3 text-right text-xs text-gray-500">Valor</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupo.filas.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400" colSpan={2}>
                      Sin registros en este grupo.
                    </TableCell>
                  </TableRow>
                ) : (
                  grupo.filas.map((fila) => (
                    <TableRow key={`${grupo.titulo}-${fila.etiqueta}`}>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{fila.etiqueta}</TableCell>
                      <TableCell className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">{fila.total}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h4 className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white">Detalle</h4>
        {vacio && (
          <p className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400">
            No hay registros para los filtros indicados.
          </p>
        )}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {reporte.detalle.columnas.map((columna) => (
                  <TableCell isHeader key={columna} className="px-4 py-3 text-left text-xs text-gray-500">
                    {columna}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reporte.detalle.filas.map((fila, index) => (
                <TableRow key={`${fila[0]}-${index}`}>
                  {fila.map((celda, celdaIndex) => (
                    <TableCell key={`${celdaIndex}-${celda}`} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {celda}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination meta={reporte.detalle.meta} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
