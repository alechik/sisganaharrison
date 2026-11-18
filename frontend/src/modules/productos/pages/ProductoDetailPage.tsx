import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { formatMoney } from "@/utils/formatMoney";
import { ProductoStatusBadge } from "../components";
import { PRODUCTO_ROUTES } from "../constants";
import { PRODUCTOS_PERMISSIONS } from "../permissions";
import { getProducto } from "../services";
import { Producto } from "../types";

export default function ProductoDetailPage() {
  const { id } = useParams();
  const productoId = Number(id);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducto = async () => {
      try {
        const data = await getProducto(productoId);
        setProducto(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del producto.");
      } finally {
        setLoading(false);
      }
    };

    if (productoId) {
      loadProducto();
    }
  }, [productoId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !producto) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Producto no encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={producto.nombre}
          items={breadcrumbs.productoDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={PRODUCTO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={PRODUCTOS_PERMISSIONS.update}>
            <Link
              to={PRODUCTO_ROUTES.edit(producto.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de Producto">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{producto.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{producto.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Presentación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {producto.presentacion_nombre || producto.presentacion_descripcion || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Categoría</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {producto.categoria_producto_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Subcategoría</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {producto.subcategoria_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre científico</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {producto.nombre_cientifico || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Precio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatMoney(producto.precio)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <ProductoStatusBadge active={producto.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {producto.created_at
                ? new Date(producto.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {producto.descripcion || "Sin descripción"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
