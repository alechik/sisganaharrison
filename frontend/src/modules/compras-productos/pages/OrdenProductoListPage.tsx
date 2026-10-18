import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { getOrdenesProductos } from "../services";
import { OrdenCompraProducto } from "../types";

export default function OrdenProductoListPage() {
  const [items, setItems] = useState<OrdenCompraProducto[]>([]);
  useEffect(() => { getOrdenesProductos({ per_page: 20 }).then((res) => setItems(res.data)); }, []);
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Órdenes de compra de productos</h1>
          <PageBreadCrumb pageTitle="Órdenes de productos" items={breadcrumbs.ordenesProductos} />
        </div>
        <Link to="/compras-productos/ordenes/crear" className="rounded-lg bg-brand-500 px-4 py-3 text-sm text-white">+ Nueva orden</Link>
      </div>
      <table className="min-w-full text-sm">
        <thead><tr><th className="px-3 py-2 text-left">Código</th><th className="px-3 py-2 text-left">Proveedor</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2 text-right">Total</th><th></th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-gray-100 dark:border-white/[0.05]">
              <td className="px-3 py-2">{item.cod_compra}</td>
              <td className="px-3 py-2">{item.proveedor_razon_social}</td>
              <td className="px-3 py-2 text-center">{item.estado}</td>
              <td className="px-3 py-2 text-right">{item.monto_total}</td>
              <td className="px-3 py-2 text-right"><Link className="text-brand-500" to={`/compras-productos/ordenes/${item.id}`}>Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
