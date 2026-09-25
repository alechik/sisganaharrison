import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { AnimalStatusBadge } from "../components";
import { ANIMAL_ROUTES } from "../constants";
import { ANIMALES_PERMISSIONS } from "../permissions";
import { getAnimal } from "../services";
import { Animal } from "../types";

export default function AnimalDetailPage() {
  const { id } = useParams();
  const animalId = Number(id);

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnimal = async () => {
      try {
        const data = await getAnimal(animalId);
        setAnimal(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del animal.");
      } finally {
        setLoading(false);
      }
    };

    if (animalId) {
      loadAnimal();
    }
  }, [animalId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !animal) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Animal no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={animal.nombre || animal.codigo}
          items={breadcrumbs.animalDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={ANIMAL_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={ANIMALES_PERMISSIONS.update}>
            <Link
              to={ANIMAL_ROUTES.edit(animal.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle del animal">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{animal.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Arete</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{animal.arete || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{animal.nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Sexo</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {animal.sexo === "M" ? "Macho" : "Hembra"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de nacimiento</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {animal.fecha_nacimiento
                ? new Date(animal.fecha_nacimiento).toLocaleDateString("es-PY")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Edad inicial (meses)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {animal.edad_inicial != null ? `${animal.edad_inicial} meses` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Edad actual (meses)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {animal.edad_actual != null ? `${animal.edad_actual} meses` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Precio por kilo</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {animal.precio_kilo != null
                ? animal.precio_kilo.toLocaleString("es-PY", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Color</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{animal.color || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Raza</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{animal.raza_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Categoría</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {animal.categoria_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado productivo</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {animal.estado_productivo_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Lote</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{animal.lote_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Madre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{animal.madre_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Padre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{animal.padre_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <AnimalStatusBadge active={animal.activo} />
              {animal.estado ? (
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{animal.estado}</span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de registro</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {animal.created_at
                ? new Date(animal.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observaciones</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {animal.observaciones || "Sin observaciones"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
