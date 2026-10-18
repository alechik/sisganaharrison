import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CategoriaProductoStatusBadge } from "../components";
import { CATEGORIA_PRODUCTO_ROUTES } from "../constants";
import { CATEGORIAS_PRODUCTOS_PERMISSIONS } from "../permissions";
import { getCategoriaProducto } from "../services";
import { CategoriaProducto } from "../types";

export default function CategoriaProductoDetailPage() {
  const { id } = useParams();
  const categoriaId = Number(id);

  const [item, setItem] = useState<CategoriaProducto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setItem(await getCategoriaProducto(categoriaId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la categoría de producto.");
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId) {
      load();
    }
  }, [categoriaId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !item) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Categoría de producto no encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={item.nombre} items={breadcrumbs.categoriaProductoDetalle} />
        <div className="flex gap-3">
          <Link
            to={CATEGORIA_PRODUCTO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={CATEGORIAS_PRODUCTOS_PERMISSIONS.update}>
            <Link
              to={CATEGORIA_PRODUCTO_ROUTES.edit(item.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de categoría de producto">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <CategoriaProductoStatusBadge active={item.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {item.created_at ? new Date(item.created_at).toLocaleString("es-PY") : "—"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
