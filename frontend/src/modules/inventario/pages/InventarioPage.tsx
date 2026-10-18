import { useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { getInventarioMovimientos, getInventarioStock } from "../services";
import { MovimientoItem, StockItem } from "../types";

const tipoLabel: Record<string, string> = {
  INGRESO_COMPRA: "Ingreso por compra",
  CONSUMO_SANITARIO: "Consumo sanitario",
  CONSUMO_REPRODUCTIVO: "Consumo reproductivo",
  ANULACION: "Anulación",
};

export default function InventarioPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoItem[]>([]);
  useEffect(() => {
    getInventarioStock({ per_page: 50 }).then((res) => setStock(res.data));
    getInventarioMovimientos({ per_page: 50 }).then((res) => setMovimientos(res.data));
  }, []);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Movimientos de inventario</h1>
        <PageBreadCrumb pageTitle="Inventario" items={breadcrumbs.inventario} />
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">Stock por almacén</h2>
        <table className="min-w-full text-sm">
          <thead><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-left">Almacén</th><th className="px-3 py-2 text-right">Stock</th><th className="px-3 py-2 text-right">Precio</th></tr></thead>
          <tbody>
            {stock.map((item) => (
              <tr key={item.id} className="border-t border-gray-100 dark:border-white/[0.05]">
                <td className="px-3 py-2">{item.producto_codigo} — {item.producto_nombre}</td>
                <td className="px-3 py-2">{item.almacen_nombre}</td>
                <td className="px-3 py-2 text-right">{item.stock}</td>
                <td className="px-3 py-2 text-right">{item.precio ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">Movimientos</h2>
        <table className="min-w-full text-sm">
          <thead><tr><th className="px-3 py-2 text-left">Tipo</th><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-left">Almacén</th><th className="px-3 py-2 text-right">Cantidad</th><th className="px-3 py-2 text-left">Origen</th></tr></thead>
          <tbody>
            {movimientos.map((item) => (
              <tr key={item.id} className="border-t border-gray-100 dark:border-white/[0.05]">
                <td className="px-3 py-2">{tipoLabel[item.tipo] ?? item.tipo}</td>
                <td className="px-3 py-2">{item.producto_nombre}</td>
                <td className="px-3 py-2">{item.almacen_nombre}</td>
                <td className="px-3 py-2 text-right">{item.cantidad}</td>
                <td className="px-3 py-2">{item.origen_type} #{item.origen_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
