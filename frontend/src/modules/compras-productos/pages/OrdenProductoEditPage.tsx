import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { OrdenProductoDecisionCard, OrdenProductoForm } from "../components";
import { ORDEN_PRODUCTO_ROUTES } from "../constants";
import { getOrdenProducto } from "../services";
import { OrdenCompraProducto } from "../types";
import { isPendiente } from "../utils";

export default function OrdenProductoEditPage() {
  const { id } = useParams();
  const ordenId = Number(id);
  const navigate = useNavigate();
  const [orden, setOrden] = useState<OrdenCompraProducto | null>(null);

  useEffect(() => {
    if (!ordenId) {
      return;
    }
    getOrdenProducto(ordenId)
      .then(setOrden)
      .catch(console.error);
  }, [ordenId]);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar orden de productos" items={breadcrumbs.ordenProductoEditar} />
      <ComponentCard title="Editar orden pendiente">
        <OrdenProductoForm ordenId={ordenId} />
      </ComponentCard>
      {orden && isPendiente(orden.estado) && (
        <OrdenProductoDecisionCard
          orden={orden}
          onDecided={(updated) => {
            setOrden(updated);
            navigate(ORDEN_PRODUCTO_ROUTES.detail(updated.id));
          }}
        />
      )}
    </div>
  );
}
