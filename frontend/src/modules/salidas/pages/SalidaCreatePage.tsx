import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SalidaForm } from "../components";

export default function SalidaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nueva salida" items={breadcrumbs.salidaCrear} />
      <ComponentCard
        title="Registrar salida física de animales"
        desc="Complete la cabecera y el detalle. Al confirmar, cada animal deja de figurar como activo."
      >
        <SalidaForm />
      </ComponentCard>
    </div>
  );
}
