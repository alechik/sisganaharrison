import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { getIngresosProductos } from "../services";
import { IngresoProducto } from "../types";

export default function IngresoProductoListPage() {
  const [items, setItems] = useState<IngresoProducto[]>([]);
  useEffect(() => { getIngresosProductos({ per_page: 20 }).then((res) => setItems(res.data)); }, []);
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ingresos de productos</h1>
          <PageBreadCrumb pageTitle="Ingresos de productos" items={breadcrumbs.ingresosProductos} />
        </div>
        <Link to="/compras-productos/ingresos/crear" className="rounded-lg bg-brand-500 px-4 py-3 text-sm text-white">+ Nuevo ingreso</Link>
      </div>
      <table className="min-w-full text-sm">
        <thead><tr><th className="px-3 py-2 text-left">Código</th><th className="px-3 py-2 text-left">Orden</th><th className="px-3 py-2 text-left">Almacén</th><th></th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-gray-100 dark:border-white/[0.05]">
              <td className="px-3 py-2">{item.cod_ingreso}</td>
              <td className="px-3 py-2">{item.orden_cod_compra}</td>
              <td className="px-3 py-2">{item.almacen_nombre}</td>
              <td className="px-3 py-2 text-right"><Link className="text-brand-500" to={`/compras-productos/ingresos/${item.id}`}>Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
