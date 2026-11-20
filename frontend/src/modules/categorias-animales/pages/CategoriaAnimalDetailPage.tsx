import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CategoriaAnimalStatusBadge } from "../components";
import { CATEGORIA_ANIMAL_ROUTES } from "../constants";
import { CATEGORIAS_ANIMALES_PERMISSIONS } from "../permissions";
import { getCategoriaAnimal } from "../services";
import { CategoriaAnimal } from "../types";
import { textoPesoReferencia, textoRegla } from "../utils";

export default function CategoriaAnimalDetailPage() {
  const { id } = useParams();
  const categoriaId = Number(id);

  const [categoria, setCategoria] = useState<CategoriaAnimal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategoria = async () => {
      try {
        const data = await getCategoriaAnimal(categoriaId);
        setCategoria(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la categoría.");
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId) {
      loadCategoria();
    }
  }, [categoriaId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !categoria) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Categoría no encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={categoria.nombre}
          items={breadcrumbs.categoriaAnimalDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={CATEGORIA_ANIMAL_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={CATEGORIAS_ANIMALES_PERMISSIONS.update}>
            <Link
              to={CATEGORIA_ANIMAL_ROUTES.edit(categoria.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de Categoría">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{categoria.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{categoria.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Sexo</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {categoria.sexo === "H" ? "Hembra" : categoria.sexo === "M" ? "Macho" : "Ambos / no aplica"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Edad</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {categoria.regla
                ? categoria.regla.edad_max_meses == null
                  ? `${categoria.regla.edad_min_meses}+ meses`
                  : `${categoria.regla.edad_min_meses}–${categoria.regla.edad_max_meses} meses`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Característica</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {categoria.caracteristica || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Peso de referencia</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {textoPesoReferencia(categoria.regla) || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Cambio de peso / índice</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {categoria.indice_aumento != null
                ? `${categoria.indice_aumento} kg cada ${categoria.cambio_peso_meses ?? 2} meses (referencia de categoría)`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Regla de asignación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {textoRegla(categoria.regla) || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <CategoriaAnimalStatusBadge active={categoria.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {categoria.created_at
                ? new Date(categoria.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {categoria.descripcion || "Sin descripción"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
